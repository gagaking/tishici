import fs from 'fs';
import { createCanvas } from 'canvas';

const sizes = [16, 48, 128];

sizes.forEach(size => {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, size * 0.2);
  ctx.fill();

  ctx.fillStyle = '#60a5fa';
  const center = size / 2;
  const dotRadius = size * 0.15;
  ctx.beginPath();
  ctx.arc(center, center, dotRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#f8fafc';
  ctx.lineWidth = Math.max(1, size * 0.08);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const margin = size * 0.2;
  const arrowSize = size * 0.15;

  ctx.beginPath();
  ctx.moveTo(size - margin, margin);
  ctx.lineTo(center + dotRadius + size*0.05, center - dotRadius - size*0.05);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(size - margin - arrowSize, margin);
  ctx.lineTo(size - margin, margin);
  ctx.lineTo(size - margin, margin + arrowSize);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(margin, size - margin);
  ctx.lineTo(center - dotRadius - size*0.05, center + dotRadius + size*0.05);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(margin + arrowSize, size - margin);
  ctx.lineTo(margin, size - margin);
  ctx.lineTo(margin, size - margin - arrowSize);
  ctx.stroke();

  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(`./public/icon${size}.png`, buffer);
  console.log(`Generated icon${size}.png`);
});
