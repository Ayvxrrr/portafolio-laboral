import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const source = await readFile(new URL('../js/about-robot.js', import.meta.url), 'utf8');
const context = vm.createContext({ window: {} });
vm.runInContext(source, context);
const { poses, samplePose, phaseForOffset } = context.window.portfolioAboutRobot.motion;

test('la escena empieza centrada y cambia a perfil y CV en los mismos umbrales de desplazamiento', () => {
  assert.equal(phaseForOffset(-10, 900), 'idle');
  assert.equal(phaseForOffset(0, 900), 'idle');
  assert.equal(phaseForOffset(1, 900), 'profile');
  assert.equal(phaseForOffset(449, 900), 'profile');
  assert.equal(phaseForOffset(450, 900), 'resume');
});

test('el robot aparece centrado antes de mostrar el perfil', () => {
  const from = { ...poses.idle, opacity: 0 };
  assert.equal(samplePose(from, 'idle', 900, true).opacity, 0);
  const end = samplePose(from, 'idle', 2000, true);
  assert.equal(end.x, 0);
  assert.equal(end.z, -6);
  assert.equal(end.opacity, 1);
  assert.equal(end.emissive, 0);
});

test('la entrada al perfil dura 1.5 segundos y termina en la pose de referencia', () => {
  const middle = samplePose(poses.idle, 'profile', 750);
  assert.equal(middle.x, 1.3);
  const end = samplePose(poses.idle, 'profile', 1500);
  for (const key of Object.keys(poses.profile)) assert.equal(end[key], poses.profile[key]);
});

test('al mostrar el CV primero gira y después se desplaza a la izquierda', () => {
  const waiting = samplePose(poses.profile, 'resume', 500);
  assert.equal(waiting.ry, poses.profile.ry);
  const turning = samplePose(poses.profile, 'resume', 1250);
  assert.notEqual(turning.ry, poses.profile.ry);
  assert.equal(turning.x, poses.profile.x);
  const end = samplePose(poses.profile, 'resume', 3000);
  for (const key of Object.keys(poses.resume)) assert.ok(Math.abs(end[key] - poses.resume[key]) < 1e-10);
});

test('retroceder interrumpe la animación sin saltos y recupera el perfil', () => {
  const interrupted = samplePose(poses.profile, 'resume', 2000);
  const start = samplePose(interrupted, 'profile', 0);
  for (const key of Object.keys(start)) assert.equal(start[key], interrupted[key]);
  const end = samplePose(interrupted, 'profile', 1500);
  for (const key of Object.keys(end)) assert.ok(Math.abs(end[key] - poses.profile[key]) < 1e-10);
});
