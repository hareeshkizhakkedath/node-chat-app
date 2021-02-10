//jshint esversion:6
const $messageForm=document.querySelector("#message-form");
const $messageFormInput=$messageForm.querySelector("input");
const $messageFormButton=$messageForm.querySelector("button");
const $SendLocationButton=document.querySelector("#send-Location");
const $messages=document.querySelector("#messages");

//templates
const messageTemplate=document.querySelector("#message-template").innerHTML;
const locationTemplate=document.querySelector("#location-template").innerHTML;
const sidebarTemplate=document.querySelector("#sidebar-template").innerHTML;
//options
const {username,room}=Qs.parse(location.search,{ ignoreQueryPrefix:true });


const socket=io();
const autoscroll=()=>{
    //new message element
    const $newMessage=$messages.lastElementChild;
    //height of new message
    const newMessageStyles=getComputedStyle($newMessage);
    const newMessageMargin=parseInt(newMessageStyles.marginBottom);
    const newMessageHeight=$newMessage.offsetHeight+newMessageMargin;
    //visible height
    const visibleHeight=$messages.offsetHeight;
    //height of messages container
    const containerHeight=$messages.scrollHeight;
    //how far i scrolled
    const scrollOffSet=$messages.scrollTop+visibleHeight;
    if ((containerHeight-newMessageHeight) >= scrollOffSet){
        $messages.scrollTop=$messages.scrollHeight;
        console.log("hi")
    }
};

socket.on("message",(message)=>{
    
    //using mustache we render the template using below code
    const html=Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML("beforeend",html);
    autoscroll();

});

socket.on("locationMessage",(url)=>{
    
    const html=Mustache.render(locationTemplate,{
        username:url.username,
        url:url.url,
        createdAt:moment(url.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML("beforeend",html);
    autoscroll();
});
socket.on("roomData",({room,users})=>{
    const html=Mustache.render(sidebarTemplate,{
        room,
        users
    });
    document.querySelector("#sidebar").innerHTML=html;
});

$messageForm.addEventListener("submit",(e)=>{
    e.preventDefault();
    $messageFormButton.setAttribute("disabled","disabled");// send button disabled when we press it 

    message=e.target.elements.message.value;
    socket.emit("messageClient",message,(error)=>{
        $messageFormButton.removeAttribute("disabled");//send button enabled after some time
        $messageFormInput.value="";
        $messageFormInput.focus();
        if(error){
           
        }
        
    });
});
$SendLocationButton.addEventListener("click",()=>{
    

    if(!navigator.geolocation){
        return("geolocation not support in your browser");
    }
    $SendLocationButton.setAttribute("disabled","disabled");
    setTimeout(()=>{
        $SendLocationButton.removeAttribute('disabled');
    },2000);
    navigator.geolocation.getCurrentPosition((position)=>{
        
        socket.emit("sendLocation",{
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        },()=>{
            
        });
    });

   
});
socket.emit("join",{username,room},(error)=>{
    if(error){
        alert(error);
        location.href="/";
    }
});
