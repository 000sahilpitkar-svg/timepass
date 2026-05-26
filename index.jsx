import { useState, useEffect, useRef, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Sphere, Torus, Cylinder, MeshDistortMaterial, Float, Stars, Environment, useEnvironment } from "@react-three/drei";
import * as THREE from "three";

// ─── GLOBAL STYLES ──────────────────────────────────────────────────────────
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Montserrat:wght@200;300;400;500&display=swap');

  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

  :root {
    --gold: #C9A84C;
    --gold-light: #E8C97A;
    --gold-pale: #F5E6B8;
    --black: #050505;
    --black-rich: #0A0A0A;
    --black-deep: #111111;
    --ivory: #F5F0E8;
    --silver: #B8B8C0;
    --champagne: #F0E6CC;
    --glow: rgba(201, 168, 76, 0.15);
    --glow-strong: rgba(201, 168, 76, 0.35);
    --font-serif: 'Cormorant Garamond', serif;
    --font-sans: 'Montserrat', sans-serif;
  }

  html { scroll-behavior: smooth; }

  body {
    background: var(--black);
    color: var(--ivory);
    font-family: var(--font-sans);
    overflow-x: hidden;
    cursor: none;
  }

  /* Custom Cursor */
  .cursor {
    position: fixed;
    width: 8px;
    height: 8px;
    background: var(--gold);
    border-radius: 50%;
    pointer-events: none;
    z-index: 9999;
    transform: translate(-50%, -50%);
    transition: transform 0.1s ease, width 0.3s ease, height 0.3s ease, background 0.3s ease;
    mix-blend-mode: screen;
  }
  .cursor-ring {
    position: fixed;
    width: 36px;
    height: 36px;
    border: 1px solid rgba(201, 168, 76, 0.6);
    border-radius: 50%;
    pointer-events: none;
    z-index: 9998;
    transform: translate(-50%, -50%);
    transition: all 0.15s ease;
  }
  .cursor.hover { width: 16px; height: 16px; }
  .cursor-ring.hover { width: 56px; height: 56px; border-color: var(--gold); }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-track { background: var(--black); }
  ::-webkit-scrollbar-thumb { background: var(--gold); border-radius: 2px; }

  /* Loading Screen */
  .loading-screen {
    position: fixed; inset: 0;
    background: var(--black);
    z-index: 10000;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2rem;
    transition: opacity 1.2s ease, visibility 1.2s ease;
  }
  .loading-screen.hidden { opacity: 0; visibility: hidden; }

  .loading-logo {
    font-family: var(--font-serif);
    font-size: 2.5rem;
    font-weight: 300;
    letter-spacing: 0.5em;
    color: var(--gold);
    text-transform: uppercase;
    animation: breathe 2s ease-in-out infinite;
  }
  .loading-bar-track {
    width: 200px; height: 1px;
    background: rgba(201,168,76,0.15);
    position: relative; overflow: hidden;
  }
  .loading-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--gold), var(--gold-light));
    transition: width 0.3s ease;
  }
  .loading-text {
    font-family: var(--font-sans);
    font-size: 0.6rem;
    letter-spacing: 0.4em;
    color: var(--silver);
    text-transform: uppercase;
  }

  @keyframes breathe {
    0%, 100% { opacity: 0.7; }
    50% { opacity: 1; }
  }

  /* NAV */
  nav {
    position: fixed;
    top: 0; left: 0; right: 0;
    z-index: 1000;
    padding: 1.8rem 4rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    transition: background 0.6s ease, backdrop-filter 0.6s ease;
  }
  nav.scrolled {
    background: rgba(5,5,5,0.85);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(201,168,76,0.08);
  }
  .nav-logo {
    font-family: var(--font-serif);
    font-size: 1.4rem;
    font-weight: 300;
    letter-spacing: 0.3em;
    color: var(--gold);
    text-transform: uppercase;
    text-decoration: none;
    cursor: none;
  }
  .nav-logo span { color: var(--ivory); font-style: italic; }
  .nav-links { display: flex; gap: 3rem; list-style: none; }
  .nav-links a {
    font-size: 0.65rem;
    letter-spacing: 0.25em;
    color: var(--silver);
    text-decoration: none;
    text-transform: uppercase;
    transition: color 0.3s ease;
    cursor: none;
  }
  .nav-links a:hover { color: var(--gold); }
  .nav-cta {
    font-size: 0.6rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--gold);
    border: 1px solid rgba(201,168,76,0.4);
    padding: 0.7rem 1.8rem;
    text-decoration: none;
    transition: all 0.4s ease;
    cursor: none;
    background: transparent;
    font-family: var(--font-sans);
  }
  .nav-cta:hover {
    background: var(--gold);
    color: var(--black);
    border-color: var(--gold);
    box-shadow: 0 0 40px rgba(201,168,76,0.3);
  }

  /* SECTIONS */
  section { position: relative; overflow: hidden; }

  /* HERO */
  .hero {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    position: relative;
  }
  .hero-canvas {
    position: absolute;
    inset: 0;
    z-index: 0;
  }
  .hero-content {
    position: relative; z-index: 2;
    text-align: center;
    pointer-events: none;
  }
  .hero-eyebrow {
    font-size: 0.58rem;
    letter-spacing: 0.5em;
    color: var(--gold);
    text-transform: uppercase;
    margin-bottom: 2rem;
    opacity: 0;
    transform: translateY(20px);
    transition: all 1.2s ease 0.5s;
  }
  .hero-eyebrow.visible { opacity: 1; transform: translateY(0); }
  .hero-headline {
    font-family: var(--font-serif);
    font-size: clamp(3.5rem, 8vw, 8rem);
    font-weight: 300;
    line-height: 1.05;
    letter-spacing: 0.03em;
    color: var(--ivory);
    margin-bottom: 2rem;
    opacity: 0;
    transform: translateY(40px);
    transition: all 1.4s ease 0.8s;
  }
  .hero-headline.visible { opacity: 1; transform: translateY(0); }
  .hero-headline em {
    font-style: italic;
    color: var(--gold);
    display: block;
  }
  .hero-sub {
    font-size: 0.75rem;
    letter-spacing: 0.2em;
    color: var(--silver);
    margin-bottom: 3.5rem;
    opacity: 0;
    transition: all 1.2s ease 1.1s;
    transform: translateY(20px);
  }
  .hero-sub.visible { opacity: 1; transform: translateY(0); }
  .hero-buttons {
    display: flex; gap: 1.5rem;
    justify-content: center;
    pointer-events: all;
    opacity: 0;
    transform: translateY(20px);
    transition: all 1.2s ease 1.4s;
  }
  .hero-buttons.visible { opacity: 1; transform: translateY(0); }
  .btn-primary {
    font-family: var(--font-sans);
    font-size: 0.62rem;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    background: var(--gold);
    color: var(--black);
    padding: 1rem 2.8rem;
    border: none;
    cursor: none;
    transition: all 0.4s ease;
    font-weight: 500;
  }
  .btn-primary:hover {
    background: var(--gold-light);
    box-shadow: 0 0 60px rgba(201,168,76,0.5);
    transform: translateY(-2px);
  }
  .btn-ghost {
    font-family: var(--font-sans);
    font-size: 0.62rem;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    background: transparent;
    color: var(--ivory);
    padding: 1rem 2.8rem;
    border: 1px solid rgba(255,255,255,0.2);
    cursor: none;
    transition: all 0.4s ease;
    font-weight: 300;
  }
  .btn-ghost:hover {
    border-color: var(--gold);
    color: var(--gold);
    transform: translateY(-2px);
  }
  .hero-scroll-hint {
    position: absolute;
    bottom: 3rem;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.6rem;
    z-index: 2;
    opacity: 0;
    transition: opacity 1s ease 2s;
  }
  .hero-scroll-hint.visible { opacity: 0.5; }
  .scroll-label {
    font-size: 0.5rem;
    letter-spacing: 0.4em;
    color: var(--silver);
    text-transform: uppercase;
  }
  .scroll-line {
    width: 1px; height: 50px;
    background: linear-gradient(to bottom, var(--gold), transparent);
    animation: scrollPulse 2s ease-in-out infinite;
  }
  @keyframes scrollPulse {
    0%, 100% { opacity: 0.3; transform: scaleY(1); }
    50% { opacity: 1; transform: scaleY(1.1); }
  }

  /* MARQUEE */
  .marquee-strip {
    padding: 1.2rem 0;
    background: rgba(201,168,76,0.04);
    border-top: 1px solid rgba(201,168,76,0.1);
    border-bottom: 1px solid rgba(201,168,76,0.1);
    overflow: hidden;
    white-space: nowrap;
  }
  .marquee-inner {
    display: inline-flex;
    animation: marquee 30s linear infinite;
    gap: 0;
  }
  .marquee-item {
    font-size: 0.55rem;
    letter-spacing: 0.4em;
    text-transform: uppercase;
    color: var(--gold);
    padding: 0 3rem;
    opacity: 0.7;
  }
  .marquee-dot {
    color: var(--gold);
    opacity: 0.3;
    padding: 0 0.5rem;
  }
  @keyframes marquee {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }

  /* COLLECTIONS */
  .collections {
    padding: 8rem 4rem;
    background: var(--black-rich);
  }
  .section-header {
    text-align: center;
    margin-bottom: 5rem;
  }
  .section-eyebrow {
    font-size: 0.55rem;
    letter-spacing: 0.5em;
    color: var(--gold);
    text-transform: uppercase;
    margin-bottom: 1.2rem;
    display: block;
  }
  .section-title {
    font-family: var(--font-serif);
    font-size: clamp(2.5rem, 5vw, 4.5rem);
    font-weight: 300;
    line-height: 1.1;
    color: var(--ivory);
    letter-spacing: 0.02em;
  }
  .section-title em { font-style: italic; color: var(--gold); }
  .section-divider {
    width: 60px; height: 1px;
    background: linear-gradient(90deg, transparent, var(--gold), transparent);
    margin: 1.5rem auto;
  }

  .collections-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2px;
    max-width: 1400px;
    margin: 0 auto;
  }
  .collection-card {
    position: relative;
    aspect-ratio: 3/4;
    overflow: hidden;
    cursor: none;
    group: true;
  }
  .collection-bg {
    position: absolute; inset: 0;
    transition: transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }
  .collection-card:hover .collection-bg { transform: scale(1.08); }
  .collection-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(to top, rgba(5,5,5,0.95) 0%, rgba(5,5,5,0.3) 50%, transparent 100%);
    transition: all 0.6s ease;
  }
  .collection-card:hover .collection-overlay {
    background: linear-gradient(to top, rgba(5,5,5,0.98) 0%, rgba(5,5,5,0.5) 60%, rgba(5,5,5,0.1) 100%);
  }
  .collection-glow {
    position: absolute; inset: 0;
    opacity: 0;
    transition: opacity 0.6s ease;
    background: radial-gradient(circle at 50% 30%, rgba(201,168,76,0.08), transparent 70%);
  }
  .collection-card:hover .collection-glow { opacity: 1; }
  .collection-content {
    position: absolute; bottom: 0; left: 0; right: 0;
    padding: 2.5rem 2rem;
    transform: translateY(10px);
    transition: transform 0.6s ease;
  }
  .collection-card:hover .collection-content { transform: translateY(0); }
  .collection-number {
    font-size: 0.5rem;
    letter-spacing: 0.3em;
    color: var(--gold);
    opacity: 0.6;
    margin-bottom: 0.8rem;
  }
  .collection-name {
    font-family: var(--font-serif);
    font-size: 1.8rem;
    font-weight: 300;
    color: var(--ivory);
    line-height: 1.2;
    margin-bottom: 0.5rem;
  }
  .collection-sub {
    font-size: 0.6rem;
    letter-spacing: 0.2em;
    color: var(--silver);
    text-transform: uppercase;
    margin-bottom: 1.2rem;
    opacity: 0;
    transform: translateY(10px);
    transition: all 0.5s ease 0.1s;
  }
  .collection-card:hover .collection-sub { opacity: 1; transform: translateY(0); }
  .collection-link {
    font-size: 0.55rem;
    letter-spacing: 0.3em;
    color: var(--gold);
    text-transform: uppercase;
    text-decoration: none;
    display: inline-flex; align-items: center; gap: 0.8rem;
    opacity: 0;
    transform: translateY(10px);
    transition: all 0.5s ease 0.15s;
    cursor: none;
  }
  .collection-card:hover .collection-link { opacity: 1; transform: translateY(0); }
  .collection-link::after {
    content: '→';
    transition: transform 0.3s ease;
  }
  .collection-link:hover::after { transform: translateX(4px); }

  /* SHOWCASE */
  .showcase {
    padding: 8rem 4rem;
    background: var(--black);
  }
  .showcase-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
    max-width: 1400px;
    margin: 5rem auto 0;
    align-items: center;
  }
  .showcase-visual {
    position: relative;
    aspect-ratio: 4/5;
    overflow: hidden;
  }
  .showcase-img {
    width: 100%; height: 100%;
    object-fit: cover;
    transition: transform 0.8s ease;
  }
  .showcase-visual:hover .showcase-img { transform: scale(1.04); }
  .showcase-badge {
    position: absolute;
    top: 2rem; right: 2rem;
    background: rgba(5,5,5,0.8);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(201,168,76,0.3);
    padding: 1rem 1.5rem;
    text-align: center;
  }
  .showcase-badge-num {
    font-family: var(--font-serif);
    font-size: 2rem;
    color: var(--gold);
    font-weight: 300;
    display: block;
    line-height: 1;
  }
  .showcase-badge-text {
    font-size: 0.5rem;
    letter-spacing: 0.2em;
    color: var(--silver);
    text-transform: uppercase;
  }
  .showcase-text { padding: 2rem 0; }
  .showcase-text .section-title { text-align: left; }
  .showcase-text .section-eyebrow { text-align: left; }
  .showcase-body {
    font-size: 0.85rem;
    line-height: 2;
    color: rgba(245,240,232,0.6);
    margin: 1.5rem 0 2.5rem;
    font-weight: 300;
    letter-spacing: 0.03em;
  }
  .showcase-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
    padding: 2rem 0;
    border-top: 1px solid rgba(201,168,76,0.1);
    border-bottom: 1px solid rgba(201,168,76,0.1);
    margin-bottom: 2.5rem;
  }
  .stat-num {
    font-family: var(--font-serif);
    font-size: 2.2rem;
    font-weight: 300;
    color: var(--gold);
    display: block;
  }
  .stat-label {
    font-size: 0.5rem;
    letter-spacing: 0.25em;
    color: var(--silver);
    text-transform: uppercase;
  }

  /* CRAFTSMANSHIP */
  .craft {
    padding: 8rem 4rem;
    background: var(--black-rich);
  }
  .craft-materials {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 2px;
    max-width: 1400px;
    margin: 5rem auto 0;
  }
  .material-card {
    aspect-ratio: 1/1.4;
    position: relative;
    overflow: hidden;
    cursor: none;
    transition: all 0.5s ease;
  }
  .material-card:hover { z-index: 2; transform: scale(1.02); }
  .material-bg {
    position: absolute; inset: 0;
    transition: transform 0.6s ease;
  }
  .material-card:hover .material-bg { transform: scale(1.1); }
  .material-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(to top, rgba(5,5,5,0.9), transparent);
  }
  .material-info {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    padding: 1.5rem 1.2rem;
  }
  .material-name {
    font-family: var(--font-serif);
    font-size: 1.2rem;
    font-weight: 300;
    color: var(--ivory);
  }
  .material-origin {
    font-size: 0.48rem;
    letter-spacing: 0.25em;
    color: var(--gold);
    text-transform: uppercase;
    margin-top: 0.3rem;
  }

  /* TESTIMONIALS */
  .testimonials {
    padding: 8rem 4rem;
    background: var(--black);
    position: relative;
  }
  .testimonials::before {
    content: '"';
    position: absolute;
    font-family: var(--font-serif);
    font-size: 40rem;
    color: rgba(201,168,76,0.02);
    top: -5rem;
    left: 2rem;
    line-height: 1;
    pointer-events: none;
  }
  .testimonials-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
    max-width: 1400px;
    margin: 5rem auto 0;
  }
  .testimonial-card {
    padding: 3rem;
    border: 1px solid rgba(201,168,76,0.1);
    background: rgba(201,168,76,0.02);
    position: relative;
    transition: all 0.5s ease;
    cursor: none;
  }
  .testimonial-card:hover {
    border-color: rgba(201,168,76,0.3);
    background: rgba(201,168,76,0.05);
    box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(201,168,76,0.05);
    transform: translateY(-4px);
  }
  .testimonial-stars {
    display: flex; gap: 4px;
    margin-bottom: 1.5rem;
  }
  .star { color: var(--gold); font-size: 0.8rem; }
  .testimonial-quote {
    font-family: var(--font-serif);
    font-size: 1.05rem;
    font-weight: 300;
    font-style: italic;
    line-height: 1.8;
    color: rgba(245,240,232,0.8);
    margin-bottom: 2rem;
  }
  .testimonial-author {
    display: flex; align-items: center; gap: 1rem;
  }
  .author-avatar {
    width: 44px; height: 44px;
    border-radius: 50%;
    border: 1px solid rgba(201,168,76,0.3);
    overflow: hidden;
    background: linear-gradient(135deg, var(--gold), var(--black-deep));
    display: flex; align-items: center; justify-content: center;
    font-family: var(--font-serif);
    font-size: 1.1rem;
    color: var(--gold-light);
  }
  .author-name {
    font-size: 0.7rem;
    letter-spacing: 0.15em;
    color: var(--ivory);
    text-transform: uppercase;
    display: block;
  }
  .author-title {
    font-size: 0.55rem;
    letter-spacing: 0.1em;
    color: var(--silver);
    opacity: 0.6;
  }

  /* ABOUT */
  .about {
    padding: 8rem 4rem;
    background: linear-gradient(to bottom, var(--black-rich), var(--black-deep));
  }
  .about-inner {
    max-width: 1400px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr 1.2fr;
    gap: 6rem;
    align-items: center;
  }
  .about-visual {
    position: relative;
  }
  .about-img-main {
    width: 100%; aspect-ratio: 3/4;
    overflow: hidden;
    position: relative;
  }
  .about-img-accent {
    position: absolute;
    width: 55%;
    aspect-ratio: 1;
    bottom: -3rem;
    right: -3rem;
    overflow: hidden;
    border: 4px solid var(--black-rich);
  }
  .about-text .section-title { text-align: left; }
  .about-text .section-eyebrow { text-align: left; }
  .about-philosophy {
    font-family: var(--font-serif);
    font-size: 1.4rem;
    font-style: italic;
    color: var(--gold);
    line-height: 1.6;
    margin: 2rem 0;
    padding-left: 1.5rem;
    border-left: 1px solid var(--gold);
  }
  .about-body {
    font-size: 0.8rem;
    line-height: 2.2;
    color: rgba(245,240,232,0.55);
    font-weight: 300;
    letter-spacing: 0.04em;
  }
  .about-signature {
    margin-top: 2.5rem;
    font-family: var(--font-serif);
    font-size: 1.6rem;
    font-style: italic;
    color: var(--gold);
  }
  .about-sig-title {
    font-size: 0.55rem;
    letter-spacing: 0.3em;
    color: var(--silver);
    text-transform: uppercase;
    margin-top: 0.3rem;
  }

  /* CONTACT */
  .contact {
    padding: 8rem 4rem;
    background: var(--black);
  }
  .contact-inner {
    max-width: 1000px;
    margin: 5rem auto 0;
    display: grid;
    grid-template-columns: 1fr 1.5fr;
    gap: 5rem;
  }
  .contact-info h3 {
    font-family: var(--font-serif);
    font-size: 1.2rem;
    font-weight: 300;
    color: var(--ivory);
    margin-bottom: 0.5rem;
  }
  .contact-info p {
    font-size: 0.7rem;
    letter-spacing: 0.08em;
    color: var(--silver);
    line-height: 1.8;
    margin-bottom: 2.5rem;
  }
  .contact-detail {
    margin-bottom: 1.5rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid rgba(201,168,76,0.08);
  }
  .contact-detail-label {
    font-size: 0.48rem;
    letter-spacing: 0.35em;
    color: var(--gold);
    text-transform: uppercase;
    margin-bottom: 0.4rem;
  }
  .contact-detail-value {
    font-size: 0.75rem;
    color: var(--ivory);
    letter-spacing: 0.05em;
  }
  .contact-form { display: flex; flex-direction: column; gap: 1.2rem; }
  .form-field { display: flex; flex-direction: column; gap: 0.5rem; }
  .form-label {
    font-size: 0.48rem;
    letter-spacing: 0.35em;
    color: var(--gold);
    text-transform: uppercase;
  }
  .form-input, .form-select, .form-textarea {
    background: rgba(201,168,76,0.03)
    border: 1px solid rgba(201,168,76,0.15);
    padding: 1rem 1.2rem;
    color: var(--ivory);
    font-family: var(--font-sans);
    font-size: 0.75rem;
    letter-spacing: 0.05em;
    outline: none;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
    cursor: none;
  }
  .form-input:focus, .form-select:focus, .form-textarea:focus {
    border-color: rgba(201,168,76,0.5);
    box-shadow: 0 0 20px rgba(201,168,76,0.08);
  }
  .form-select { appearance: none; }
  .form-textarea { resize: none; height: 120px; }
  ::placeholder { color: rgba(184,184,192,0.4); font-size: 0.7rem; }
  .form-submit {
    font-family: var(--font-sans);
    font-size: 0.6rem;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    background: var(--gold);
    color: var(--black);
    padding: 1.2rem 2.5rem;
    border: none;
    cursor: none;
    font-weight: 500;
    transition: all 0.4s ease;
    align-self: flex-start;
    margin-top: 0.5rem;
  }
  .form-submit:hover {
    background: var(--gold-light);
    box-shadow: 0 0 40px rgba(201,168,76,0.4);
    transform: translateY(-2px);
  }

  /* FOOTER */
  footer {
    padding: 4rem 4rem 3rem;
    background: var(--black-deep);
    border-top: 1px solid rgba(201,168,76,0.08);
  }
  .footer-top {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 4rem;
    margin-bottom: 4rem;
  }
  .footer-brand {
    font-family: var(--font-serif);
    font-size: 1.6rem;
    font-weight: 300;
    letter-spacing: 0.2em;
    color: var(--gold);
    text-transform: uppercase;
    margin-bottom: 1rem;
  }
  .footer-tagline {
    font-size: 0.65rem;
    line-height: 1.9;
    color: rgba(184,184,192,0.5);
    letter-spacing: 0.05em;
    max-width: 280px;
  }
  .footer-col-title {
    font-size: 0.5rem;
    letter-spacing: 0.4em;
    color: var(--gold);
    text-transform: uppercase;
    margin-bottom: 1.5rem;
  }
  .footer-links { list-style: none; display: flex; flex-direction: column; gap: 0.8rem; }
  .footer-links a {
    font-size: 0.65rem;
    letter-spacing: 0.1em;
    color: rgba(184,184,192,0.55);
    text-decoration: none;
    transition: color 0.3s ease;
    cursor: none;
  }
  .footer-links a:hover { color: var(--gold); }
  .footer-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 2rem;
    border-top: 1px solid rgba(201,168,76,0.06);
  }
  .footer-copy {
    font-size: 0.55rem;
    letter-spacing: 0.15em;
    color: rgba(184,184,192,0.3);
    text-transform: uppercase;
  }
  .footer-legal {
    display: flex; gap: 2rem;
  }
  .footer-legal a {
    font-size: 0.5rem;
    letter-spacing: 0.15em;
    color: rgba(184,184,192,0.3);
    text-decoration: none;
    text-transform: uppercase;
    transition: color 0.3s ease;
    cursor: none;
  }
  .footer-legal a:hover { color: var(--silver); }

  /* AMBIENT PARTICLES */
  .particles-canvas {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 1;
  }

  /* REVEAL ANIMATIONS */
  .reveal {
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.9s ease, transform 0.9s ease;
  }
  .reveal.in-view {
    opacity: 1;
    transform: translateY(0);
  }
  .reveal-delay-1 { transition-delay: 0.1s; }
  .reveal-delay-2 { transition-delay: 0.2s; }
  .reveal-delay-3 { transition-delay: 0.3s; }
  .reveal-delay-4 { transition-delay: 0.4s; }
  .reveal-delay-5 { transition-delay: 0.5s; }

  /* GOLD LINE ACCENT */
  .gold-accent-line {
    width: 1px;
    height: 80px;
    background: linear-gradient(to bottom, var(--gold), transparent);
    margin: 0 auto 2rem;
  }

  @media (max-width: 1024px) {
    nav { padding: 1.5rem 2rem; }
    .nav-links { display: none; }
    .collections-grid { grid-template-columns: repeat(2, 1fr); }
    .craft-materials { grid-template-columns: repeat(3, 1fr); }
    .testimonials-grid { grid-template-columns: 1fr 1fr; }
    .about-inner { grid-template-columns: 1fr; gap: 3rem; }
    .about-img-main { aspect-ratio: 16/9; }
    .contact-inner { grid-template-columns: 1fr; }
    .footer-top { grid-template-columns: 1fr 1fr; }
  }
  @media (max-width: 768px) {
    .collections-grid { grid-template-columns: 1fr; }
    .craft-materials { grid-template-columns: repeat(2, 1fr); }
    .testimonials-grid { grid-template-columns: 1fr; }
    .showcase-grid { grid-template-columns: 1fr; }
    .collections, .showcase, .craft, .testimonials, .about, .contact { padding: 5rem 1.5rem; }
    nav { padding: 1.2rem 1.5rem; }
  }
`;

// ─── 3D CHANDELIER ───────────────────────────────────────────────────────────
function CrystalDrop({ position, size = 0.04, delay = 0 }) {
  const meshRef = useRef();
  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.elapsedTime + delay;
      meshRef.current.rotation.y = t * 0.3;
      meshRef.current.position.y = position[1] + Math.sin(t * 0.5) * 0.02;
    }
  });
  return (
    <mesh ref={meshRef} position={position} castShadow>
      <octahedronGeometry args={[size, 0]} />
      <meshPhysicalMaterial
        color="#E8D5A0"
        metalness={0.1}
        roughness={0}
        transmission={0.95}
        thickness={0.5}
        ior={2.4}
        reflectivity={1}
        transparent
        opacity={0.9}
      />
    </mesh>
  );
}

function GoldArm({ rotation, radius = 1.2, y = 0 }) {
  const angle = rotation;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  return (
    <group>
      <mesh position={[x / 2, y, z / 2]} rotation={[0, -angle, Math.PI / 12]}>
        <cylinderGeometry args={[0.008, 0.005, radius, 8]} />
        <meshPhysicalMaterial color="#C9A84C" metalness={0.95} roughness={0.1} />
      </mesh>
      <mesh position={[x, y - 0.15, z]}>
        <cylinderGeometry args={[0.02, 0.015, 0.3, 8]} />
        <meshPhysicalMaterial color="#C9A84C" metalness={0.9} roughness={0.15} />
      </mesh>
    </group>
  );
}

function Chandelier() {
  const groupRef = useRef();
  const { mouse } = useThree();

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.elapsedTime;
      // Gentle floating
      groupRef.current.position.y = Math.sin(t * 0.4) * 0.08;
      // Mouse parallax
      groupRef.current.rotation.y += (mouse.x * 0.3 - groupRef.current.rotation.y) * 0.03;
      groupRef.current.rotation.x += (mouse.y * 0.08 - groupRef.current.rotation.x) * 0.03;
      // Slow base rotation
      groupRef.current.rotation.y += 0.001;
    }
  });

  const armAngles = Array.from({ length: 8 }, (_, i) => (i * Math.PI * 2) / 8);
  const innerAngles = Array.from({ length: 5 }, (_, i) => (i * Math.PI * 2) / 5);

  // Crystal drops arranged in circles
  const crystals = [];
  // Outer ring
  for (let i = 0; i < 16; i++) {
    const a = (i * Math.PI * 2) / 16;
    const r = 1.3;
    const drops = Math.floor(Math.random() * 3) + 2;
    for (let d = 0; d < drops; d++) {
      crystals.push({
        pos: [Math.cos(a) * r + (Math.random() - 0.5) * 0.1, -0.5 - d * 0.12 - Math.random() * 0.1, Math.sin(a) * r + (Math.random() - 0.5) * 0.1],
        size: 0.025 + Math.random() * 0.02,
        delay: i * 0.3 + d * 0.1
      });
    }
  }
  // Mid ring
  for (let i = 0; i < 10; i++) {
    const a = (i * Math.PI * 2) / 10;
    const r = 0.8;
    const drops = Math.floor(Math.random() * 4) + 3;
    for (let d = 0; d < drops; d++) {
      crystals.push({
        pos: [Math.cos(a) * r, -0.3 - d * 0.1, Math.sin(a) * r],
        size: 0.02 + Math.random() * 0.015,
        delay: i * 0.2 + d * 0.15
      });
    }
  }
  // Center drop
  for (let d = 0; d < 8; d++) {
    crystals.push({
      pos: [0, -0.6 - d * 0.15, 0],
      size: 0.04 - d * 0.003,
      delay: d * 0.2
    });
  }

  return (
    <group ref={groupRef}>
      {/* Main chain / ceiling mount */}
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.6, 12]} />
        <meshPhysicalMaterial color="#C9A84C" metalness={0.95} roughness={0.05} />
      </mesh>
      {/* Top ornament */}
      <mesh position={[0, 1.15, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshPhysicalMaterial color="#C9A84C" metalness={0.95} roughness={0.05} envMapIntensity={2} />
      </mesh>
      {/* Central column */}
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.06, 0.04, 1.2, 12]} />
        <meshPhysicalMaterial color="#B8960A" metalness={0.9} roughness={0.15} />
      </mesh>
      {/* Upper tier ring */}
      <mesh position={[0, 0.15, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.0, 0.025, 8, 64]} />
        <meshPhysicalMaterial color="#C9A84C" metalness={0.95} roughness={0.08} />
      </mesh>
      {/* Mid tier ring */}
      <mesh position={[0, -0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.25, 0.02, 8, 64]} />
        <meshPhysicalMaterial color="#C9A84C" metalness={0.95} roughness={0.08} />
      </mesh>
      {/* Lower tier ring */}
      <mesh position={[0, -0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.9, 0.018, 8, 48]} />
        <meshPhysicalMaterial color="#C9A84C" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Arms outer */}
      {armAngles.map((angle, i) => <GoldArm key={`arm-out-${i}`} rotation={angle} radius={1.1} y={0.1} />)}
      {/* Arms inner */}
      {innerAngles.map((angle, i) => <GoldArm key={`arm-in-${i}`} rotation={angle} radius={0.65} y={-0.05} />)}
      {/* Candle bulb lights */}
      {armAngles.map((angle, i) => (
        <group key={`candle-${i}`} position={[Math.cos(angle) * 1.1, -0.07, Math.sin(angle) * 1.1]}>
          <mesh>
            <cylinderGeometry args={[0.018, 0.015, 0.12, 8]} />
            <meshPhysicalMaterial color="#FFF8DC" emissive="#FFF0A0" emissiveIntensity={2} metalness={0} roughness={0.8} />
          </mesh>
          <pointLight intensity={0.4} distance={1.5} color="#FFE28A" />
        </group>
      ))}
      {/* Crystals */}
      {crystals.map((c, i) => (
        <CrystalDrop key={i} position={c.pos} size={c.size} delay={c.delay} />
      ))}
      {/* Central crystal cluster */}
      <mesh position={[0, -1.2, 0]}>
        <octahedronGeometry args={[0.12, 1]} />
        <meshPhysicalMaterial
          color="#E8D5A0"
          metalness={0}
          roughness={0}
          transmission={0.9}
          thickness={0.8}
          ior={2.5}
          transparent
          opacity={0.95}
        />
      </mesh>
      {/* Center glow */}
      <pointLight position={[0, 0, 0]} intensity={3} distance={4} color="#FFD080" />
      <pointLight position={[0, -1, 0]} intensity={1.5} distance={3} color="#FFC840" />
    </group>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.1} color="#1A1000" />
      <spotLight
        position={[0, 8, 0]}
        intensity={6}
        angle={0.3}
        penumbra={0.8}
        color="#FFF5E0"
        castShadow
      />
      <spotLight position={[-4, 4, 2]} intensity={1.5} color="#C9A84C" angle={0.4} penumbra={1} />
      <spotLight position={[4, 4, -2]} intensity={1} color="#E8C97A" angle={0.5} penumbra={1} />
      <pointLight position={[0, -3, 0]} intensity={0.5} color="#C9A84C" distance={6} />
      <Environment preset="studio" />
      <Float speed={0.5} rotationIntensity={0.05} floatIntensity={0.3}>
        <Chandelier />
      </Float>
      <Stars radius={80} depth={30} count={800} factor={2} saturation={0.2} fade speed={0.3} />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate={false}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.8}
      />
    </>
  );
}

// ─── PARTICLES ───────────────────────────────────────────────────────────────
function AmbientParticles() {
  const canvasRef = useRef();
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const particles = Array.from({ length: 50 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.2,
      vy: -Math.random() * 0.3 - 0.1,
      opacity: Math.random() * 0.4 + 0.05,
      life: Math.random(),
    }));

    let raf;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life += 0.003;
        if (p.y < -5 || p.life > 1) {
          p.x = Math.random() * canvas.width;
          p.y = canvas.height + 5;
          p.life = 0;
        }
        const op = Math.sin(p.life * Math.PI) * p.opacity;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201, 168, 76, ${op})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={canvasRef} className="particles-canvas" style={{ width: "100%", height: "100%" }} />;
}

// ─── LUXURY GRADIENT BACKGROUNDS FOR CARDS ───────────────────────────────────
const collectionBgs = [
  "linear-gradient(135deg, #1a1208 0%, #2d1f08 40%, #1a0f05 100%)",
  "linear-gradient(135deg, #0d1520 0%, #0a1a2e 40%, #060d18 100%)",
  "linear-gradient(135deg, #18120a 0%, #2a1a0a 40%, #130d05 100%)",
  "linear-gradient(135deg, #080808 0%, #151515 40%, #0a0a0a 100%)",
  "linear-gradient(135deg, #15100d 0%, #231810 40%, #100b07 100%)",
  "linear-gradient(135deg, #0a0d12 0%, #141a22 40%, #080b10 100%)",
];

const materialBgs = [
  "radial-gradient(ellipse at 50% 30%, #C0C0C8 0%, #808088 40%, #404048 100%)",
  "radial-gradient(ellipse at 40% 20%, #F0E8D0 0%, #C9A84C 40%, #8B6914 100%)",
  "radial-gradient(ellipse at 50% 40%, #A89060 0%, #6B5A38 40%, #3A2E18 100%)",
  "radial-gradient(ellipse at 50% 20%, #E8F0F8 0%, #B8C8D8 40%, #788898 100%)",
  "radial-gradient(ellipse at 50% 30%, #F8F0E8 0%, #D4C4A8 40%, #8C7860 100%)",
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function LuminaryApp() {
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [cursorRingPos, setCursorRingPos] = useState({ x: 0, y: 0 });
  const [isHover, setIsHover] = useState(false);

  // Inject styles
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = globalStyles;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Loading
  useEffect(() => {
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 18;
      if (p >= 100) {
        p = 100;
        clearInterval(iv);
        setTimeout(() => {
          setLoading(false);
          setTimeout(() => setHeroVisible(true), 200);
        }, 500);
      }
      setLoadProgress(Math.min(p, 100));
    }, 120);
    return () => clearInterval(iv);
  }, []);

  // Scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Cursor
  useEffect(() => {
    const move = (e) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
      setTimeout(() => setCursorRingPos({ x: e.clientX, y: e.clientY }), 80);
    };
    const over = (e) => setIsHover(!!e.target.closest("button, a, [cursor-hover]"));
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
    };
  }, []);

  useScrollReveal();

  const collections = [
    { num: "01", name: "Celestia", sub: "Crystal & 24K Gold", desc: "Handcrafted Swarovski crystal drops" },
    { num: "02", name: "Noir Impérial", sub: "Matte Black & Gold", desc: "Contemporary palace series" },
    { num: "03", name: "Aurora", sub: "Venetian Glass", desc: "Murano glass artisanal collection" },
    { num: "04", name: "Versailles", sub: "Royal Heritage", desc: "Classic grandeur reimagined" },
    { num: "05", name: "Eclipse", sub: "Modern Minimal", desc: "Architectural statement pieces" },
    { num: "06", name: "Soleil", sub: "Champagne & Bronze", desc: "Warm contemporary luxury" },
  ];

  const materials = [
    { name: "Sterling Crystal", origin: "Schönau, Austria" },
    { name: "24K Gold Leaf", origin: "Florence, Italy" },
    { name: "Aged Brass", origin: "London Foundry" },
    { name: "Venetian Glass", origin: "Murano, Italy" },
    { name: "Calacatta Marble", origin: "Carrara, Italy" },
  ];

  const testimonials = [
    { initials: "AK", name: "H.H. Prince Al-Khalid", title: "Royal Palace, Dubai", quote: "The Celestia collection transformed our grand ballroom into something truly transcendent. Every crystal refracts light like a thousand stars — it is beyond any chandelier we have ever seen." },
    { initials: "MR", name: "Marco Rossetti", title: "General Manager, Hotel de Crillon, Paris", quote: "We required something that matched the grandeur of our 18th-century architecture while speaking to the modern era. Luminary delivered a masterpiece that guests photograph every single day." },
    { initials: "VS", name: "Victoria Sinclair", title: "Lead Interior Architect, Sinclair Design Group", quote: "I have specified lighting for projects from Mayfair to Monaco. No atelier matches the precision, scale, and sheer emotional power of a Luminary piece. They are simply in a class alone." },
  ];

  return (
    <div style={{ background: "var(--black)", minHeight: "100vh" }}>
      {/* Custom Cursor */}
      <div className={`cursor ${isHover ? "hover" : ""}`} style={{ left: cursorPos.x, top: cursorPos.y }} />
      <div className={`cursor-ring ${isHover ? "hover" : ""}`} style={{ left: cursorRingPos.x, top: cursorRingPos.y }} />

      {/* Loading Screen */}
      <div className={`loading-screen ${!loading ? "hidden" : ""}`}>
        <div className="loading-logo">Luminary</div>
        <div className="loading-bar-track">
          <div className="loading-bar-fill" style={{ width: `${loadProgress}%` }} />
        </div>
        <div className="loading-text">Crafting Excellence · {Math.round(loadProgress)}%</div>
      </div>

      {/* NAV */}
      <nav className={scrolled ? "scrolled" : ""}>
        <a href="#" className="nav-logo">Lumi<span>nary</span></a>
        <ul className="nav-links">
          {["Collections", "Bespoke", "Projects", "Craftsmanship", "About"].map((l) => (
            <li key={l}><a href="#">{l}</a></li>
          ))}
        </ul>
        <button className="nav-cta">Private Consultation</button>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-canvas">
          <Canvas
            camera={{ position: [0, 0, 4.5], fov: 45 }}
            gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
            shadows
          >
            <Scene />
          </Canvas>
        </div>
        <AmbientParticles />

        <div className="hero-content">
          <div className={`hero-eyebrow ${heroVisible ? "visible" : ""}`}>
            Maison de Lumière · Est. MMXII · Paris · Dubai · New York
          </div>
          <h1 className={`hero-headline ${heroVisible ? "visible" : ""}`}>
            Illuminate Luxury<em>Beyond Imagination</em>
          </h1>
          <p className={`hero-sub ${heroVisible ? "visible" : ""}`}>
            Architectural chandelier art for the world's most extraordinary spaces
          </p>
          <div className={`hero-buttons ${heroVisible ? "visible" : ""}`}>
            <button className="btn-primary">Explore Collection</button>
            <button className="btn-ghost">Book Private Consultation</button>
          </div>
        </div>

        <div className={`hero-scroll-hint ${heroVisible ? "visible" : ""}`}>
          <div className="scroll-label">Scroll</div>
          <div className="scroll-line" />
        </div>
      </section>

      {/* MARQUEE */}
      <div className="marquee-strip">
        <div className="marquee-inner">
          {[...Array(2)].map((_, ri) =>
            ["Bespoke Creations", "Swarovski Crystal", "24K Gold", "Venetian Glass", "Royal Palaces", "Five-Star Hotels", "Ultra-Luxury Villas", "Handcrafted Excellence", "Paris · Dubai · Monaco · New York", "Since 2012"].map((item, i) => (
              <span key={`${ri}-${i}`}>
                <span className="marquee-item">{item}</span>
                <span className="marquee-dot">✦</span>
              </span>
            ))
          )}
        </div>
      </div>

      {/* COLLECTIONS */}
      <section className="collections">
        <div className="section-header reveal">
          <span className="section-eyebrow">The Collections</span>
          <h2 className="section-title">Artistry Without<em> Boundaries</em></h2>
          <div className="section-divider" />
        </div>
        <div className="collections-grid">
          {collections.map((c, i) => (
            <div className={`collection-card reveal reveal-delay-${(i % 3) + 1}`} key={c.num}>
              <div className="collection-bg" style={{ background: collectionBgs[i], width: "100%", height: "100%" }}>
                <div style={{
                  position: "absolute", inset: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  opacity: 0.15,
                }}>
                  <div style={{
                    width: "140px", height: "140px",
                    border: "1px solid var(--gold)",
                    borderRadius: "50%",
                    position: "relative",
                  }}>
                    {[0, 45, 90, 135].map((r) => (
                      <div key={r} style={{
                        position: "absolute",
                        inset: 0, margin: "auto",
                        width: "2px", height: "140px",
                        background: "linear-gradient(to bottom, transparent, var(--gold), transparent)",
                        transform: `rotate(${r}deg)`,
                        transformOrigin: "center",
                      }} />
                    ))}
                    <div style={{
                      position: "absolute", inset: "30%",
                      borderRadius: "50%",
                      border: "1px solid var(--gold)",
                    }} />
                  </div>
                </div>
              </div>
              <div className="collection-overlay" />
              <div className="collection-glow" />
              <div className="collection-content">
                <div className="collection-number">{c.num}</div>
                <div className="collection-name">{c.name}</div>
                <div className="collection-sub">{c.sub}</div>
                <a href="#" className="collection-link">View Collection</a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SHOWCASE */}
      <section className="showcase">
        <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
          <div className="section-header reveal">
            <span className="section-eyebrow">Spaces of Distinction</span>
            <h2 className="section-title">Where Light Becomes<em> Architecture</em></h2>
            <div className="section-divider" />
          </div>
          <div className="showcase-grid">
            <div className="showcase-visual reveal reveal-delay-1">
              <div style={{
                width: "100%", height: "100%", aspectRatio: "4/5",
                background: "linear-gradient(135deg, #1a1000 0%, #2d1a00 30%, #0d0800 70%, #080500 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                position: "relative", overflow: "hidden",
              }}>
                {/* Stylized interior visual */}
                <div style={{ position: "absolute", inset: 0 }}>
                  <div style={{
                    position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)",
                    width: "3px", height: "30%",
                    background: "linear-gradient(to bottom, var(--gold), var(--gold-pale))",
                    boxShadow: "0 0 30px 5px rgba(201,168,76,0.4)",
                  }} />
                  <div style={{
                    position: "absolute", top: "38%", left: "50%", transform: "translateX(-50%)",
                    width: "120px", height: "120px",
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(201,168,76,0.3), transparent 70%)",
                    filter: "blur(15px)",
                  }} />
                  {[-60, -30, 0, 30, 60].map((x, i) => (
                    <div key={i} style={{
                      position: "absolute",
                      top: "40%", left: `calc(50% + ${x}px)`,
                      transform: "translateX(-50%)",
                      width: "3px", height: `${40 + i * 5}px`,
                      background: "linear-gradient(to bottom, var(--gold), rgba(201,168,76,0.2))",
                      opacity: 0.6 + i * 0.05,
                    }} />
                  ))}
                  <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0, height: "40%",
                    background: "linear-gradient(to top, rgba(201,168,76,0.05), transparent)",
                  }} />
                  <div style={{
                    position: "absolute", bottom: "10%", left: "10%", right: "10%",
                    height: "30%",
                    background: "linear-gradient(135deg, rgba(5,5,5,0.8), rgba(20,15,5,0.6))",
                    backdropFilter: "blur(5px)",
                    border: "1px solid rgba(201,168,76,0.1)",
                  }} />
                </div>
              </div>
              <div className="showcase-badge">
                <span className="showcase-badge-num">180+</span>
                <span className="showcase-badge-text">Iconic Installations</span>
              </div>
            </div>
            <div className="showcase-text reveal reveal-delay-2">
              <span className="section-eyebrow">Grand Hotel Series</span>
              <h3 className="section-title" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}>
                Lobby&nbsp;&amp; Ballroom<em> Masterworks</em>
              </h3>
              <div className="section-divider" style={{ margin: "1.5rem 0" }} />
              <p className="showcase-body">
                From the soaring lobbies of five-star palaces to the intimate grandeur of private ballrooms, each Luminary installation is conceived as a singular work of architectural light sculpture. We collaborate directly with the world's foremost interior architects to create pieces that define the very soul of a space.
              </p>
              <div className="showcase-stats">
                {[["42", "Countries"], ["18", "Years"], ["300+", "Projects"]].map(([num, label]) => (
                  <div key={label}>
                    <span className="stat-num">{num}</span>
                    <span className="stat-label">{label}</span>
                  </div>
                ))}
              </div>
              <button className="btn-primary">View Our Projects</button>
            </div>
          </div>
        </div>
      </section>

      {/* CRAFTSMANSHIP */}
      <section className="craft">
        <div className="section-header reveal">
          <span className="section-eyebrow">Materials &amp; Craft</span>
          <h2 className="section-title">Only the Finest<em> Elements</em></h2>
          <div className="section-divider" />
          <p style={{ color: "var(--silver)", fontSize: "0.75rem", letterSpacing: "0.08em", maxWidth: "560px", margin: "1rem auto 0", lineHeight: 2, opacity: 0.7, fontWeight: 300 }}>
            Every Luminary piece is born from materials sourced at the apex of their craft — Austrian crystal, Florentine gold, Venetian glass — assembled by master artisans in our Paris atelier.
          </p>
        </div>
        <div className="craft-materials">
          {materials.map((m, i) => (
            <div className={`material-card reveal reveal-delay-${i + 1}`} key={m.name}>
              <div className="material-bg" style={{ background: materialBgs[i], width: "100%", height: "100%" }} />
              <div className="material-overlay" />
              <div className="material-info">
                <div className="material-name">{m.name}</div>
                <div className="material-origin">{m.origin}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testimonials">
        <div className="section-header reveal">
          <span className="section-eyebrow">Client Voices</span>
          <h2 className="section-title">Words of the<em> Discerning</em></h2>
          <div className="section-divider" />
        </div>
        <div className="testimonials-grid" style={{ maxWidth: "1400px", margin: "5rem auto 0" }}>
          {testimonials.map((t, i) => (
            <div className={`testimonial-card reveal reveal-delay-${i + 1}`} key={t.name}>
              <div className="testimonial-stars">
                {[...Array(5)].map((_, j) => <span key={j} className="star">★</span>)}
              </div>
              <p className="testimonial-quote">{t.quote}</p>
              <div className="testimonial-author">
                <div className="author-avatar">{t.initials}</div>
                <div>
                  <span className="author-name">{t.name}</span>
                  <span className="author-title">{t.title}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section className="about">
        <div className="about-inner">
          <div className="about-visual reveal reveal-delay-1">
            <div className="about-img-main">
              <div style={{
                width: "100%", height: "100%", aspectRatio: "3/4",
                background: "linear-gradient(160deg, #1a1005 0%, #2d1f08 30%, #0d0a05 70%, #050302 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                position: "relative", overflow: "hidden",
              }}>
                <div style={{
                  width: "200px", height: "200px",
                  borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(201,168,76,0.2), transparent 70%)",
                  filter: "blur(30px)",
                  position: "absolute", top: "30%",
                }} />
                <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
                  <div style={{
                    fontFamily: "Cormorant Garamond, serif",
                    fontSize: "5rem", fontWeight: 300,
                    color: "var(--gold)", opacity: 0.6,
                    lineHeight: 1,
                  }}>L</div>
                  <div style={{
                    width: "60px", height: "1px",
                    background: "linear-gradient(90deg, transparent, var(--gold), transparent)",
                    margin: "1rem auto",
                  }} />
                  <div style={{
                    fontSize: "0.45rem", letterSpacing: "0.5em",
                    color: "var(--silver)", textTransform: "uppercase",
                  }}>Maison Luminary</div>
                </div>
              </div>
            </div>
            <div className="about-img-accent">
              <div style={{
                width: "100%", height: "100%", aspectRatio: "1",
                background: "linear-gradient(135deg, #C9A84C, #8B6914)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{
                    fontFamily: "Cormorant Garamond, serif",
                    fontSize: "2rem", color: "var(--black)",
                    fontStyle: "italic", fontWeight: 300,
                    lineHeight: 1.2,
                  }}>Atelier<br />Paris</div>
                </div>
              </div>
            </div>
          </div>
          <div className="about-text reveal reveal-delay-2">
            <span className="section-eyebrow">Our Story</span>
            <h2 className="section-title" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}>
              A Philosophy of<em> Light</em>
            </h2>
            <div className="about-philosophy">
              "Light is not merely illumination — it is emotion, architecture, and memory made visible."
            </div>
            <p className="about-body">
              Founded in Paris in 2012 by master craftsman Édouard Lumière, our atelier was born from a singular conviction: that architectural lighting should be indistinguishable from fine art. Working exclusively with the world's finest materials — Austrian Swarovski crystal, 24-karat Florentine gold leaf, hand-blown Murano glass — we create chandeliers that do not simply inhabit a space but define it entirely.
            </p>
            <p className="about-body" style={{ marginTop: "1rem" }}>
              Every piece originates as a sculptural sketch, passes through the hands of our thirty master artisans in Paris, and is installed by our own team across forty-two countries. From the royal palaces of the Middle East to the landmark hotels of the French Riviera, a Luminary chandelier is a statement that transcends decoration.
            </p>
            <div className="about-signature">Édouard Lumière</div>
            <div className="about-sig-title">Founder &amp; Master Craftsman</div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section className="contact">
        <div className="section-header reveal">
          <div className="gold-accent-line" />
          <span className="section-eyebrow">Private Consultation</span>
          <h2 className="section-title">Begin Your<em> Commission</em></h2>
          <div className="section-divider" />
          <p style={{ color: "var(--silver)", fontSize: "0.72rem", letterSpacing: "0.08em", maxWidth: "500px", margin: "1rem auto 0", lineHeight: 2, opacity: 0.7, fontWeight: 300 }}>
            Every Luminary piece begins with a private consultation. Our design directors work directly with your architect, interior designer, and estate team to conceive something truly singular.
          </p>
        </div>
        <div className="contact-inner">
          <div className="contact-info reveal reveal-delay-1">
            <h3>Our Showrooms</h3>
            <p>Open by private appointment only</p>
            {[
              { city: "Paris", address: "12 Rue du Faubourg Saint-Honoré, 75008" },
              { city: "Dubai", address: "DIFC Gate Avenue, Level 4" },
              { city: "New York", address: "540 Madison Avenue, Suite 2500" },
            ].map((s) => (
              <div className="contact-detail" key={s.city}>
                <div className="contact-detail-label">{s.city}</div>
                <div className="contact-detail-value">{s.address}</div>
              </div>
            ))}
            <div className="contact-detail">
              <div className="contact-detail-label">Private Line</div>
              <div className="contact-detail-value">+33 1 47 20 00 00</div>
            </div>
          </div>
          <div className="contact-form reveal reveal-delay-2">
            <div className="form-field">
              <label className="form-label">Full Name</label>
              <input className="form-input" placeholder="Your name" />
            </div>
            <div className="form-field">
              <label className="form-label">Email Address</label>
              <input className="form-input" placeholder="your@email.com" />
            </div>
            <div className="form-field">
              <label className="form-label">Project Type</label>
              <select className="form-select">
                <option value="">Select your project</option>
                <option>Private Residence</option>
                <option>Luxury Hotel</option>
                <option>Royal Palace</option>
                <option>Penthouse</option>
                <option>Commercial / Hospitality</option>
                <option>Yacht / Private Aviation</option>
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">Your Vision</label>
              <textarea className="form-textarea" placeholder="Describe your space and aspirations..." />
            </div>
            <button className="form-submit">Request Consultation</button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-top">
          <div>
            <div className="footer-brand">Luminary</div>
            <p className="footer-tagline">
              Maison de Lumière. Architectural chandelier art for the world's most extraordinary spaces. Atelier Paris since 2012.
            </p>
          </div>
          {[
            { title: "Collections", links: ["Celestia", "Noir Impérial", "Aurora", "Versailles", "Eclipse", "Bespoke"] },
            { title: "Atelier", links: ["About Us", "Craftsmanship", "Materials", "Process", "Careers"] },
            { title: "Contact", links: ["Paris Showroom", "Dubai Showroom", "New York Showroom", "Private Consultation", "Press"] },
          ].map((col) => (
            <div key={col.title}>
              <div className="footer-col-title">{col.title}</div>
              <ul className="footer-links">
                {col.links.map((l) => <li key={l}><a href="#">{l}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="footer-bottom">
          <div className="footer-copy">© MMXXVI Luminary · All Rights Reserved</div>
          <div className="footer-legal">
            {["Privacy Policy", "Terms", "Legal"].map((l) => <a key={l} href="#">{l}</a>)}
          </div>
        </div>
      </footer>
    </div>
  );
                    
