
//подключаем на страницу vk

VK.init({
   // apiId: 6759975
    apiId: 6760009
});


function Auth(){
    return new Promise((resolve) => {
        VK.Auth.login(data => {
            if(data.session){
                resolve(true)
            } else {
                //reject(new Error('Failed to login'));
                resolve(false);
            }
        })
    })
}

function callAPI(method, params){
    params.v = '5.92';

    return new Promise((resolve,reject) => {
        VK.api(method, params, (data) => {
            if(data.error){
                reject(data.error)
            } else {
                resolve(data.response)
            }
        })
    })

}

async function mockOn() {
    console.error('failed to login, the data will be load from local file');
        // Parse JSON string into object   
    var friendsObj = await loadJSON().then(responce => {
        return JSON.parse(responce);
    })
    
    //console.log(friendsObj);  
    return friendsObj;      
}
 
function loadJSON() { 
    return new Promise((resolve) => {
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', 'assets/data/friends_list.json', true); 
    xobj.onreadystatechange = function () {
            if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            resolve(xobj.responseText);
           }
    };
    xobj.send(null); 
    })
}



Auth()
    .then((answer) => {
        console.log(answer)
        if (answer){
       // return callAPI('users.get', {})    
            return callAPI('friends.get', {fields: 'photo_100'})
        }else{
            new Error('Failed to login');
            return mockOn();
        }
    })
    .then(friends => {        
        if (!localStorage.targetData || localStorage.targetData === ''){
            renderFriends(friends, document.querySelector('#friends_template_left').textContent, 
            document.querySelector('#source_list'));
            
            renderFriends({items:[]}, document.querySelector('#friends_template_right').textContent, 
            document.querySelector('#target_list'));
        } else {            
            renderFromStorage(friends.items);
        }   

        var source_zone = document.querySelector('#source_zone');
        var target_zone = document.querySelector('#target_zone');
        
        makeDnD(source_zone, target_zone);
            
    });


const btn = document.querySelector('button');

document.addEventListener('click', e => {
    if (e.target.classList.contains('friend')){
        var rect = e.target.getBoundingClientRect();
        if(e.clientX > rect.left+rect.width-15 
            && e.clientY > rect.top+rect.height/3 
            && e.clientY < rect.top+2*rect.height/3){
            moveFriend(e.target);
        }
    }
})

btn.addEventListener('click', () => {

    if(localStorage.targetData){
    localStorage.targetData = '';    
    }
    
    let target = document.querySelector('#target_zone');       
    let stringData = [];
    for (var friend of target.children){            
        stringData.push(friend.getAttribute('id'))
    }    
    localStorage.targetData = stringData;            
})

document.addEventListener('keyup', (e) => { 
    if(e.target.classList.contains('input')){
        let half = e.target.closest('.half'); 
        if (!e.target.value) {
            noFilter (half.querySelector('.friends-list'));
            return;
        }
        dressCode(e.target.value, half.querySelector('.friends-list'));
    }
})

function renderFromStorage(vk_items){
    var storage_list = loadStorage();
    var right_friends={items:[]};
    var left_friends = {items:[]};
    var i = 0;

    for(var item of vk_items){
        if (i < storage_list.length){           
            if(item.id === storage_list[i]){
                right_friends.items.push(item)  
                console.log(vk_items.length)              
                i++;                    
            } else {
            left_friends.items.push(item);
            }
        } else {            
            left_friends.items.push(item);
        }      
        
    } 

    renderFriends(left_friends, document.querySelector('#friends_template_left').textContent, 
    document.querySelector('#source_list'));
        
    renderFriends(right_friends, document.querySelector('#friends_template_right').textContent, 
    document.querySelector('#target_list')) 
}

function renderFriends(friends, template, parent) {
    const render = Handlebars.compile(template);
    const html = render(friends);
    parent.innerHTML = html;
}

function loadStorage(){
    if(localStorage.targetData && localStorage.targetData !== ''){
        var id_list = []; 
        for (var elem of localStorage.targetData.split(',')){
            id_list.push(parseInt(elem));
        }                
        return id_list.sort(function(a, b){return a - b});  
    }
}

function noFilter (friends){
    if (friends.innerHTML){        
        for(let friend of friends.children){
            friend.style.display = "flex";
        }
    }
}
            
function dressCode (chunk, friends) {    
    if (friends.innerHTML){        
        for(let friend of friends.children){
            if (isMatching (friend.querySelector('#friend_name').innerHTML, chunk)) { 
                friend.style.display = "flex";
            } else {
                friend.style.display = "none";
            }   
        }              
    }    
}


function isMatching (full, chunk) {  
    function checkMatch (index) {
        for (var char of chunkArr) {
            if (fullArr[index] !== char) {
                return false;
            }
            index++;
        }
        
        return true;
    }

    var fullArr = full.toUpperCase().split('');
    var chunkArr = chunk.toUpperCase().split('');

    for (var i = 0; i< fullArr.length; i++) {
        if (chunkArr[0] === fullArr[i]) {
            if (fullArr.lenght - i < chunkArr.length) {
                return false;
            }
            if (checkMatch(i)) {
                return true;
            }
        }
    }

    return false;  
}

function checkFilter(friend, target_zone){
    let half = target_zone.closest('.half'); 
    let filter = half.querySelector('#filter');
    if (filter.value !== ''){
        if (!isMatching (friend.querySelector('#friend_name').innerHTML, filter.value)) {
            friend.style.display = "none";
        }
    }
}

function moveFriend(friend_node){
    // не понимаю почему не видит определнне выше source и target 
    // даже если передать их как аргументы??
    let source = document.querySelector('#source_zone');
    let target = document.querySelector('#target_zone');

    toggleFriendClass(friend_node);

    if(friend_node.parentNode === source){
        checkFilter(friend_node, target);
        target.appendChild(friend_node);

    } else {
        checkFilter(friend_node, source);
        source.appendChild(friend_node)
    }
}

function toggleFriendClass(friend_node){
    friend_node.classList.toggle('friend-right');
    friend_node.classList.toggle('friend-left');
}

function makeDnD(z_source, z_target){
    let currentDrag;
    
    //z_source.addEventListener('dragstart', (e) => {
    document.addEventListener('dragstart', (e) => {
        currentDrag = {'source': z_source, 'node': e.target};
    })

    //z_source.addEventListener('dragover', (e) => {
    document.addEventListener('dragover', (e) => {
        e.preventDefault();
    })

    //z_target.addEventListener('drop', (e) => {
    document.addEventListener('drop', (e) => {
        if(currentDrag){
            e.preventDefault(); 

            if(e.target === z_target 
                || e.target.parentNode === z_target 
                || e.target.parentNode.parentNode === z_target){                    

                toggleFriendClass(currentDrag.node)
                checkFilter(currentDrag.node, z_target);
            
                if(e.target !== z_target){
                    z_target.insertBefore(currentDrag.node, e.target.nextElementSibling);
                    
                } else {
                    z_target.appendChild(currentDrag.node);
                }
                
                currentDrag = null;
            }
        }
    })

}