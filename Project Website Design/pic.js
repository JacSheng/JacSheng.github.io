
    let imgs =document.getElementsByTagName('img');
    for(let i=1;i<imgs.length;i++){
        imgs[i].onmouseover = function(){
            imgs[0].src = this.src;
        }
    }
    
