# 회중 구역카드

[이곳](https://app.congassist.xyz) 에서 확인해 보실 수 있습니다.

#### 테스트 로그인 정보
* 회중: 안성공도
* 아이디: admin
* 비밀번호: admin

## 설정
자신의 계정에서 사용하고 싶다면 아래의 설정과정을 참조하세요.

1. Google Map API Key, Firebase API Key 설정

> [Google Cloud Platform](https://console.cloud.google.com/apis/credentials) 에서 Google Map API 를 활성화 하고 API Key 를 `/src/environments/environment.example.ts` 에 있는 googleApi 에 넣는다.

> [Firebase](https://console.firebase.google.com/project/) 사이트에서 API Key 등의 정보를 `environment.example.ts` 에 넣는다.

2. environment 설정

> `environment.example.ts` 파일을 `environment.ts` 로 파일명을 변경한다.

3. Dependencies 설치

> `npm install` 명령어를 폴더의 터미널에서 실행

4. Local 환경에서 테스트

> `ng serve -o`

5. Build

> `ng build`

6. Firebase 로 Deploy. (`firebase-tools` 설치 필요) [참조사이트](https://firebase.google.com/docs/hosting/deploying)

> `firebase deploy`
