# CoolCrate AI — Shelf-Life Prediction Demo

Prototype for **CoolCrate**, a modular solar-powered cold storage solution for
smallholder vegetable farmers. Built for the 1M1B Internship on Green Skills
and Applied AI for Climate Action.

## What this is

Smallholder farmers lose 25–30% of perishable produce between harvest and
market due to lack of cold storage. CoolCrate is a pay-per-use, solar-powered
cold storage unit deployed at farmer cooperative collection points.

This demo shows the AI layer behind the product: a **produce-decay
prediction model** that estimates remaining shelf life for a batch of
produce, and recommends whether (and when) to book a CoolCrate storage slot.

## How the model works

The prediction uses a **Q10 decay coefficient** — a standard postharvest
food-science model where spoilage rate roughly doubles for every 10°C rise
above a 25°C reference temperature. Each produce type has a reference
ambient shelf life and a cold-storage shelf life; the model adjusts the
ambient estimate for the entered temperature and days since harvest, then
flags risk level (safe / at risk / critical) and recommends the best
available storage slot.

## Running locally

```bash
npm install
npm run dev
```

Then open the local URL Vite prints (usually `http://localhost:5173`).

## Tech stack

- React + Vite
- [lucide-react](https://lucide.dev) for icons
- Plain CSS-in-JS (no external UI framework)

## Project structure

```
src/
  CoolCrateDemo.jsx   # Main component — inputs, decay model, results UI
  main.jsx            # React entry point
index.html
```
