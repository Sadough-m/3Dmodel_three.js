# 3D App

A React + Vite 3D viewer built with Three.js, GSAP, and Tailwind CSS. This project loads an STL model, renders it in a responsive WebGL canvas, and allows adding/removing interactive spheres with live controls.

## 🚀 Features

- STL model loading with `three/examples/jsm/loaders/STLLoader`
- Interactive orbit controls and keyboard navigation
- Dynamic sphere creation, removal, and live property editing
- Smooth camera focus transitions using `gsap`
- Shadowed scene lighting with directional and ambient lights
- React state and Three.js scene synchronization

## 🧩 Project Structure

- `src/App.jsx` — main 3D scene setup and UI logic
- `src/main.jsx` — app entry point
- `public/models/3D_Model.stl` — STL model asset used in the scene
- `index.html` — Vite HTML template
- `package.json` — project dependencies and scripts

## 🛠️ Technologies Used

- React 19
- Vite
- Three.js 0.183
- GSAP 3
- Tailwind CSS

## 📦 Install

```bash
npm install
```

## ▶️ Run Locally

```bash
npm run dev
```

Then open the local development URL shown by Vite.

## 🔧 Usage

- Click **Add Sphere** to spawn a new sphere in the scene
- Select a sphere card to focus the camera on that sphere
- Use the slider to adjust sphere radius
- Use the color picker to change sphere material color
- Use arrow keys and `W/A/S/D` to move the camera in the 3D scene

## 💡 Notes

- The scene is rendered using a `WebGLRenderer` and `OrbitControls`
- All spheres are stored in React state and kept in sync with Three.js mesh objects
- Removing a sphere also disposes of its geometry and material to prevent memory leaks

## 📁 Recommended Enhancements

- Add a dedicated UI panel for model/scene settings
- Add touch controls for mobile compatibility
- Display a loading indicator while the STL file loads
- Enable export of sphere positions or scene snapshots

## 📄 License

This project is currently private and can be adapted for public use.
