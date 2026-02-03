# Lite2D 문서

Lite2D는 2D 픽셀 기반 웹 게임을 위한 경량 게임 프레임워크입니다.

## 목차

1. [아키텍처](architecture.md) - 프레임워크 구조 및 설계
2. [API 문서](api.md) - 클래스 및 메서드 레퍼런스
3. [게임 루프](gameloop.md) - Update/Render 루프 동작 방식
4. [레이어 시스템](layer.md) - World/Screen Space 렌더링 분리
5. [물리 시스템](physics.md) - 2D 물리 엔진 및 충돌 처리
6. [오디오 시스템](audio.md) - 사운드 재생 및 관리
7. [튜토리얼](tutorial.md) - 시작하기 가이드

## 특징

- **Canvas 기반 렌더링**: HTML5 Canvas를 사용한 2D 렌더링
- **GameObject 상속 구조**: Cocos2D 스타일의 GameObject 기반 아키텍처
- **Tree 구조**: 부모-자식 관계로 계층 구조 지원
- **Update -> Render 루프**: 명확한 게임 루프 구조
- **Transform 시스템**: 위치, 회전, 스케일 관리 및 계층 변환
- **물리 시스템**: 2D 강체 동역학 및 충돌 처리
- **오디오 시스템**: BGM/SFX 재생, 페이드 효과, 볼륨 제어
- **입력 관리**: 키보드/마우스 입력 처리
- **리소스 로딩**: 이미지/오디오 비동기 로딩 및 캐싱
- **TypeScript**: 완전한 타입 지원

## 핵심 클래스

### Core
- **Engine**: 게임 루프 및 엔진 관리
- **GameObject**: 모든 게임 오브젝트의 베이스 클래스
- **Scene**: 게임 씬 관리
- **Layer**: 렌더링 레이어 (World/Screen Space 분리)
- **Transform**: 위치/회전/스케일 관리
- **Component**: 확장 가능한 컴포넌트 시스템

### Rendering
- **Sprite**: 2D 이미지 렌더링
- **AnimatedSprite**: 스프라이트 시트 애니메이션
- **Camera**: 카메라 및 뷰포트 관리

### Input
- **InputManager**: 키보드/마우스 입력 처리

### Assets
- **AssetLoader**: 리소스 로딩 및 캐싱

### Physics
- **PhysicsManager**: 물리 시스템 관리
- **RigidBody**: 강체 컴포넌트
- **BoxCollider/CircleCollider**: AABB 및 원형 충돌체
- **PhysicsMaterial**: 마찰 및 반발 계수

### Audio
- **SoundManager**: 사운드 재생 관리
- **AudioSource**: GameObject용 오디오 컴포넌트

### Utils
- **Vector2**: 2D 벡터 연산
- **MathUtils**: 수학 유틸리티 함수

## 간단한 예제

```typescript
import { Engine, Scene, Sprite, Vector2 } from 'lite2d';

// 엔진 초기화
const engine = new Engine('gameCanvas', 800, 600);

// 씬 생성
const scene = new Scene('MainScene', 800, 600);

// 스프라이트 생성 및 추가
const sprite = new Sprite('MySprite');
sprite.transform.position = new Vector2(400, 300);
scene.addGameObject(sprite);

// 씬 로드 및 시작
await engine.loadScene(scene);
engine.start();
```

## 개발 환경 설정

### 의존성 설치
```bash
npm install
```

### 개발 서버 실행
```bash
npm run dev
```

### 프로덕션 빌드
```bash
npm run build
```

## 라이선스

MIT License

## 기여

이슈 및 Pull Request를 환영합니다!
