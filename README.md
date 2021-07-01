## Frontend Fun
Online Web-based code editor for HTML, CSS, and JavaScript with live reload can be used for practice, quick mockups, or CSS experiments

### :sparkles: Features
- Preview HTML, CSS, and JavaScript with live reload
- Backup and Restore data from anywhere with UID
- Offline Support
- Word Wrap on Code Editor

### Installation
Clone the repository
```bash
git clone https://github.com/abdulsamad/frontend-fun.git
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

![Frontend fun screenshot](/readme/screenshot.png "Frontend fun screenshot")

<!-- ### Architechture
![project architechture](/readme/architechture.png "project architechture") -->