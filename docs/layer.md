# Layer 시스템

## 개요

Layer는 Godot의 CanvasLayer에서 영감을 받은 렌더링 레이어 시스템입니다. World Space와 Screen Space를 체계적으로 분리하여 카메라 변환을 레이어 단위로 관리합니다.

## 핵심 개념

### 기존 문제점

```
Engine.render()
├── ctx.save()
├── camera.applyTransform(ctx)  ← 모든 오브젝트에 적용
├── scene.render(ctx)
└── ctx.restore()

→ Screen Space UI는 각자 ctx.setTransform(1,0,0,1,0,0) 호출 필요
→ 비효율적이고 반복적인 코드 발생
```

### Layer 솔루션

```
Scene
├── Layer("World", camera)      ← 카메라 변환 적용
│   ├── TileMap
│   └── Player
│
└── Layer("UI", null)           ← Screen Space (변환 없음)
    ├── HUD
    └── Dialog
```

## Layer 클래스

Layer는 **GameObject를 상속**받아 기존 parent-child 시스템을 그대로 활용합니다.

```typescript
class Layer extends GameObject {
  camera: Camera | null;  // null이면 Screen Space

  constructor(name: string, camera: Camera | null = null);
  render(ctx: CanvasRenderingContext2D): void;
}
```

### 주요 특징

- **GameObject 상속**: 기존 addChild(), sortingOrder 등 활용
- **독립적 카메라**: 각 레이어가 자체 카메라(또는 null) 보유
- **자동 변환 처리**: 레이어 내 오브젝트는 수동 setTransform 불필요

## 사용법

### 기본 사용 (권장)

Scene은 기본적으로 World Layer와 UI Layer를 자동 생성합니다.

```typescript
import { Scene } from 'lite2d';

// Scene 생성 (World, UI Layer 자동 생성됨)
const scene = new Scene('MainScene', 800, 600);

// World Layer에 오브젝트 추가 (카메라 변환 적용)
scene.world.addChild(player);
scene.world.addChild(tileMap);

// UI Layer에 오브젝트 추가 (Screen Space)
scene.ui.addChild(hud);
scene.ui.addChild(dialog);
```

### 커스텀 레이어 생성

추가 레이어가 필요한 경우:

```typescript
import { Layer } from 'lite2d';

// 이펙트 레이어 (카메라 적용, World와 UI 사이)
const effectLayer = new Layer('Effects', scene.camera);
effectLayer.sortingOrder = 500;
scene.addGameObject(effectLayer);

// 미니맵 레이어 (별도 카메라)
const minimapCamera = new Camera(200, 150);
const minimapLayer = new Layer('Minimap', minimapCamera);
minimapLayer.sortingOrder = 900;
scene.addGameObject(minimapLayer);
```

### Scene 헬퍼 메서드

추가 World/UI 레이어가 필요한 경우:

```typescript
const extraWorldLayer = scene.createWorldLayer('Background');
extraWorldLayer.sortingOrder = -100;  // World 뒤에

const extraUILayer = scene.createUILayer('Overlay', 2000);  // UI 위에
```

### 레이어 순서 제어

기본 레이어의 sortingOrder:
- `scene.world`: 0 (World Space)
- `scene.ui`: 1000 (Screen Space)

```typescript
// 추가 레이어로 순서 제어
const backgroundLayer = new Layer('Background', scene.camera);
backgroundLayer.sortingOrder = -100;  // World 뒤
scene.addGameObject(backgroundLayer);

const effectLayer = new Layer('Effects', scene.camera);
effectLayer.sortingOrder = 500;       // World와 UI 사이
scene.addGameObject(effectLayer);
```


## 렌더링 흐름

```
Scene.render()
│
├── Layer("Background")
│   └── ctx.save() → camera.applyTransform() → children.render() → ctx.restore()
│
├── Layer("World")
│   └── ctx.save() → camera.applyTransform() → children.render() → ctx.restore()
│
└── Layer("UI")
    └── ctx.save() → (no transform) → children.render() → ctx.restore()
```

## World Space vs Screen Space

| | World Space | Screen Space |
|---|---|---|
| Layer 설정 | `new Layer('name', camera)` | `new Layer('name', null)` |
| 카메라 영향 | 받음 | 안 받음 |
| 좌표계 | 월드 좌표 | 화면 좌표 |
| 용도 | 게임 오브젝트 | UI, HUD |

## 기존 코드 마이그레이션

### Before (수동 setTransform)

```typescript
// UI 컴포넌트
class HUD extends GameObject {
  onRender(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);  // 수동 카메라 변환 리셋
    // 렌더링...
    ctx.restore();
  }
}

// Scene에 직접 추가
scene.addGameObject(player);
scene.addGameObject(hud);
```

### After (Layer 사용)

```typescript
// UI 컴포넌트 - setTransform 제거
class HUD extends GameObject {
  onRender(ctx: CanvasRenderingContext2D): void {
    // 렌더링만 (Layer가 변환 처리)
  }
}

// Scene이 기본 레이어를 자동 생성
const scene = new Scene('MainScene', 800, 600);

scene.world.addChild(player);
scene.ui.addChild(hud);
```

## 장점

1. **명확한 구조**: World/UI 분리가 코드 레벨에서 명확
2. **코드 중복 제거**: 각 UI에서 setTransform 호출 불필요
3. **유연한 확장**: 미니맵, 이펙트 등 다양한 레이어 추가 가능
4. **기존 시스템 활용**: parent-child, sortingOrder 그대로 사용
5. **레이어 제어**: 레이어 단위로 visible, active 제어 가능

## 주의사항

### UIManager와 함께 사용

UIManager를 사용하는 경우, UI Layer의 카메라 정보를 전달해야 합니다:

```typescript
const uiManager = new UIManager(inputManager, scene.camera);
// UI Layer가 Screen Space(camera: null)이면
// UIManager가 좌표 변환 없이 처리
```

### 레이어 내 sortingOrder

레이어 내부의 오브젝트들도 sortingOrder로 순서 제어 가능:

```typescript
// UI Layer 내에서
hud.sortingOrder = 0;
dialog.sortingOrder = 100;  // HUD 위에 표시
```
