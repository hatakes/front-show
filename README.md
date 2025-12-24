# 豪华互动圣诞树 (Grand Luxury Interactive Christmas Tree)

## 项目简介

这是一个基于 **React 19 + TypeScript + React Three Fiber + Drei + Postprocessing + Tailwind CSS** 的高保真 3D Web 体验，主视觉呈现“奢华风”的圣诞树：深祖母绿与高光金色为主色调，并搭配电影级 Bloom 光晕效果。

应用包含 **CHAOS（混沌散落）** 与 **FORMED（聚合成树）** 两种形态，通过双坐标系统在两者之间平滑变形。同时加入 **手势识别交互**：张开手触发混沌散开，握拳回归成树，移动手掌可调整视角。

## 功能亮点

- **双坐标系统**：每个元素同时拥有 ChaosPosition 与 TargetPosition，在 `useFrame` 中插值。
- **针叶系统**：使用 `THREE.Points + ShaderMaterial` 渲染大量粒子。
- **装饰物系统**：礼物盒、彩球、灯光、拍立得照片等装饰使用 `InstancedMesh` 提升性能。
- **后期处理**：Bloom 阈值 `0.8`、强度 `1.2`，营造金色辉光。
- **环境光**：使用 Lobby HDRI，营造高级质感。

## 启动方式

```bash
npm install
npm run dev
```

> 若在安装依赖时遇到权限或代理限制，请确保可访问 npm registry。

## 技术栈

- React 19 + TypeScript
- React Three Fiber / Drei
- Postprocessing
- Tailwind CSS

## 交互说明

- **张开手掌**：触发 CHAOS 模式
- **握拳**：回到 FORMED 模式
- **移动手掌**：控制视角旋转
