[![Netlify Status](https://api.netlify.com/api/v1/badges/9d80dacc-64b1-4d3a-b72a-a29816e953a6/deploy-status)](https://app.netlify.com/sites/frontend-fun/deploys)

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
Netlify CLI is also required to run serverless functions
```bash
yarn global add netlify-cli
```
or
```bash
npm install -g netlify-cli
```

### Environment Variables
Create a .env file in the project root and add the following variables
```js
DATABASE_URI = /* Your MongoDB URI */
```


### Development

If you don't have Netlify account, [Create Netlify account](https://app.netlify.com/) (You can also login with GitHub, Gitlab &amp; Bitbucket)

Login into Netlify CLI with command `netlify login` and grant access to Netlify CLI

Run **`netlify link`** command in project directory and link your project to Netlify

Run **`netlify dev`** command to start local server

For more information visit [Netlify CLI docs](https://docs.netlify.com/cli/get-started/)

> 💡 **Note:** Netlify free plan limits the serverless functions to timeout at 10 seconds. It is possible that saving data won't work on Netlify free plan. It will work locally.

### Screenshot

![Frontend fun screenshot](/readme/screenshot.png "Frontend fun screenshot")

<!-- ### Architechture
![project architechture](/readme/architechture.png "project architechture") -->