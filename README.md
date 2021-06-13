## Frontend Fun
Online code editor for HTML, CSS, and JavaScript with live reload

### Installation
Clone the repository
```bash
git clone https://github.com/abdulsamad/front-end_code_editor.git
```

Install dependencies

```bash
yarn
```
or
```bash
npm install
```
Vercel CLI is also required to run serverless functions
```bash
yarn global add vercel
```
or
```bash
npm install -g vercel
```

### Environment Variables
Create a .env file in the project root and add the following variables
```js
DATABASE_URI = /* Your MongoDB URI */
```


### Development

If you don't have vercel account, [Create Vercel account](https://vercel.com/dashboard) (You can also login with GitHub, Gitlab &amp; Bitbucket)

Login into Vercel CLI with command `vercel login` and enter the credentials

Run **`vercel`** command in project directory and connect project to vercel account

Run **`vercel dev`** command to start local server

For more information visit [Vercel CLI docs](https://vercel.com/docs/cli)

### Screenshot

![Front-end code editor](/readme/screenshot.png "Front-end code editor screenshot")

### Architechture
![project architechture](/readme/architechture.png "project architechture")