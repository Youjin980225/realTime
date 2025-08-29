## 🏃RealTime 과제 - 1조 박유진

#### 1. 프로젝트 개요

플레이어는 장애물을 피하며 점수를 획득하고, 아이템을 획득함으로 추가 점수를 얻습니다.
웹소켓을 이용하여 실시간으로 점수 업데이트가 가능합니다.

#### 2. 기술 스텍

- 💻언어 및 런타임 : Java Script, Node.js(Java Script런타임)
- 📦패키지 매니저 : npm
- 🛠️의존성 : `Socket.IO`

<프론트앤드>

- `HTML`, `HTML Canvas`, `CSS`

#### 3. 프로젝트 구조

      ├── 📁assets
      │ ├── 📄item_unlock.json
      │ ├── 📄item.json
      │ ├── 📄obstacle.json
      │ └── 📄stage.json
      ├── 📁model
      │ ├── 📄score.model.js
      │ ├── 📄stage.model.js
      │ └── 📄user.model.js
      ├── 📁public
      │ ├──📁.idea
      │ ├──📁images
      │ ├── 📄CactiController.js
      │ ├── 📄Cactus.js
      │ ├── 📄Constatnts.js
      │ ├── 📄Ground.js
      │ ├── 📄index.html
      │ ├── 📄index.js
      │ ├── 📄Item.js
      │ ├── 📄ItemController.js
      │ ├── 📄player.js
      │ ├── 📄Score.js
      │ ├── 📄Socket.js
      │ └── 📄style.css
      ├── 📁src
      │ └── 📁handler
      │   ├──📄game.handler.js
      │   ├──📄handlerMapping.js
      │   ├──📄helper.js
      │   ├──📄obstacle.handler.js
      │   ├──📄register.handler.js
      │   └── 📄stage.handler.js
      │ └── 📁init
      │   ├──📄assets.js
      │   └──📄socket.js
      │ └── 📄app.js
      │ └── 📄constants.js
      └── 📄README.md

#### 4. 향후 개선사항

시간이 지나가면 체력이 조금씩 줄어들고, 체력 회복 아이텥을 등장시켜 장애물에 부딪혀도 즉사하지 않고 달릴 수 있도록 추후 개발
