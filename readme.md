Simple web app to filter friends in VKontakte social network https://vk.com
If user has account in this network after authentication he will see his actual 'friends',
in case authentication declining the app will display the list of random 'friends' loaded from local file. 

When app is opened, it generate a list of tiles, every tile displays name and small profile picture of all user's friends.
User can move friend's tiles between two areas by clicking or dragging. 
Both areas have filter option for quick search through the friend's lists.
The button 'Save' save the position of the tiles after users action.

To setup project:

clone this repo

npm i

npm run gulp 

check, that app send request to VK from http://localhost/3000/ 

