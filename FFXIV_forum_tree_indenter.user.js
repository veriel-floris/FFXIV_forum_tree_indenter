// ==UserScript==
// @name        FFXIV forum tree indenter
// @namespace   Veriel.Floris
// @description フォーラムのコメント毎にインデントをつけ、折り畳みます。
// @include     http://forum.square-enix.com/*
// @grant       none
// @version     2.0
// ==/UserScript==
//GM_log("FFXIV forum tree indenter");
(function(){
    // --------------------------------------------------
    // wait load
    window.addEventListener('load', function() {
        var indent_px = 20;
console.log('loaded');
        
        // --------------------------------------------------
        // get tree structure
        var postdata = [];
        var postsummary =[];
        get_tree_structure( postdata, postsummary );
        
console.log('tree analysed');
        // --------------------------------------------------
        // add style
        for( i in postdata ) {
            post = document.getElementById( "post_" + i );
            if( post != null ) {
                postwidth = post.clientWidth;
                post.style.margin="0 0 0 "+postdata[i]*indent_px+"px";
                post.style.width=postwidth-postdata[i]*indent_px+"px";
                
                // --------------------------------------------------
                // get view flag
                postdate = post.getElementsByClassName('postdate');
                viewflag = "new";
                if( postdate[0] != null ) {
                    if( postdate[0].getAttribute('class') == "postdate old" ) {
                        viewflag = "old";
                    }
                } else {
                    viewflag = "del";
                }
console.log('view flag set');
                
                // --------------------------------------------------
                // add summary to posthead
                posthead = (post.getElementsByClassName('posthead'))[0];
                posthead.style.whiteSpace = "nowrap";
                
                username = (post.getElementsByClassName('username'))[0].title;
                usertitle = (post.getElementsByClassName('usertitle'))[0].innerHTML.trim();
                nodecontrols = (post.getElementsByClassName('nodecontrols'))[0];
                
                el_username = document.createElement('b');
                el_username.className = "username";
                el_username.style.margin = "0 0 0 10px";
                if( usertitle != "Player" ) {
                    el_username.style.color = "red";
                    el_username.style.font = "verdana";
                }
                el_username.innerHTML = username;
                el_username_span = document.createElement('span');
                el_username_span.appendChild( el_username );
                
                el_summary = document.createElement('i');
                el_summary.style.margin = "0 0 0 10px";
                el_summary.innerHTML = postsummary[i];
                el_summary_span = document.createElement('span');
                el_summary_span.appendChild( el_summary );
                
                if( viewflag == "del" ) {
                    posthead.appendChild( el_username_span );
                    posthead.appendChild( el_summary_span );
                } else {
                    postdate[0].appendChild( el_username_span );
                    postdate[0].appendChild( el_summary_span );
                    
                    el_likeitic = document.createElement('div');
                    el_likeitic.className = "likeitic";
                    el_likeitic.style.cssFloat = "right";
                    el_likeitic.style.marginRight = "50px";
                    el_likeitic.innerHTML = (post.getElementsByClassName('likeitic'))[0].innerHTML;
                    
                    posthead.appendChild( el_likeitic );
                }
console.log('port head added');
                
                // --------------------------------------------------
                // collapse comments
                if( viewflag == "old" ) {
                    postdetails = (post.getElementsByClassName('postdetails'))[0];
                    postfoot = (post.getElementsByClassName('postfoot'))[0];
                    postdetails.style.display = "none";
                    postfoot.style.display = "none";
                    posthead.className = "posthead none " + i;
                } else if( viewflag == "del" ) {
                    // collapse deleted comment
                    userinfo = (post.getElementsByClassName('userinfo'))[0];
                    postbody = (post.getElementsByClassName('postbody'))[0];
                    userinfo.style.display = "none";
                    postbody.style.display = "none";
                    posthead.className = "posthead del none";
                }
                
console.log('collapse set');
                // --------------------------------------------------
                // add click event (collapse)
                posthead.addEventListener('click', function() {
                    cl = this.getAttribute('class');
                    postclass = cl.split(/ /);
                    post = document.getElementById( "post_" + postclass[2] );
                    if( post != null ) {
                        postdetails = (post.getElementsByClassName('postdetails'))[0];
                        postfoot = (post.getElementsByClassName('postfoot'))[0];
                        if( postclass[1] == "none" ) {
                            postdetails.style.display = "block";
                            postfoot.style.display = "block";
                            this.className = "posthead block " + postclass[2];
                        } else {
                            postdetails.style.display = "none";
                            postfoot.style.display = "none";
                            this.className = "posthead none "  + postclass[2];
                        }
                    }
                }, false );
console.log('click event set');
            }
        }
        
        // --------------------------------------------------
        // add menu
        postlist_popups = document.getElementById('postlist_popups');
        
        postlist_popups.appendChild( menu = add_popupmenu( "popup_allopen", "全て開く" ) );
        menu.addEventListener('click', function(){all_openclose( true )}, false );
        
        postlist_popups.appendChild( menu = add_popupmenu( "popup_allclose", "全て閉じる" ) );
        menu.addEventListener('click', function(){all_openclose( false )}, false );
        
        postlist_popups.appendChild( menu = add_popupmenu( "popup_newdaysopen", "近日分を開く" ) );
        menu.addEventListener('click', newdays_open, false );
        
console.log('menu added');
    }, true );
})();

// --------------------------------------------------
function add_popupmenu( menu_en, menu_jp ) {
    menu = document.createElement('a');
    menu.id = "menu_" + menu_en;
    menu.className = "popupctrl";
    menu.href="javascript://"
    menu.innerHTML = menu_jp;
    
    menu_h6 = document.createElement('h6');
    menu_h6.appendChild( menu );
    
    popupmenu = document.createElement('li');
    popupmenu.id = "popupmenu_" + menu_en;
    popupmenu.className = "menu";
    popupmenu.appendChild( menu_h6 );
    
    return popupmenu;
}

// --------------------------------------------------
// get tree structure
function get_tree_structure( postdata, postsummary ) {
    treedata = document.getElementById('posttree').getElementsByTagName('script');
    data = treedata[0].innerHTML.split(/\r\n|\r|\n/);
    
    for( i=0; i<data.length; i++ ) {
        ln = data[i].replace(/writeLink\(/g, "" );
        dt = ln.split(/, /);
        // dt = 0:comment_no  4:tree_structure  5:summary
        if( parseInt( dt[0].trim() ) > 0) {
            indent = dt[4].replace(/"/g,"");
            if( indent == "" ) {
                indent_count = 0;
            } else {
                indent_count = (indent.split(/,/)).length;
            }
            postdata[dt[0].trim()] = indent_count;
            postsummary[dt[0].trim()] = dt[5].replace(/"/g,"");
        }
    }
}

// --------------------------------------------------
// append all open
function all_openclose( openflag ) {
    // --------------------------------------------------
    // get tree structure
    var postdata = [];
    var postsummary =[];
    get_tree_structure( postdata, postsummary );
    
    for( i in postdata ) {
        post = document.getElementById( "post_" + i );
        if( post != null ) {
            posthead = (post.getElementsByClassName('posthead'))[0];
            cl = posthead.getAttribute('class');
            postclass = cl.split(/ /);
            if( postclass[1] == "del" ) {
                continue;
            }
            postdetails = (post.getElementsByClassName('postdetails'))[0];
            postfoot = (post.getElementsByClassName('postfoot'))[0];
            
            if( openflag ) {
                postdetails.style.display = "block";
                postfoot.style.display = "block";
                posthead.className = "posthead block " + i;
            } else {
                postdetails.style.display = "none";
                postfoot.style.display = "none";
                posthead.className = "posthead none " + i;
            }
        }
    }
}

// --------------------------------------------------
// append newdays open
function newdays_open() {
    // --------------------------------------------------
    // get tree structure
    var postdata = [];
    var postsummary =[];
    get_tree_structure( postdata, postsummary );
    
    for( i in postdata ) {
        post = document.getElementById( "post_" + i );
        if( post != null ) {
            // get date data
            datestr = (post.getElementsByClassName('date'))[0].innerHTML.substring(0,2);
            if( datestr == "今日" || datestr == "昨日" ) {
                newdayflag = true;
            } else {
                newdayflag = false;
            }
            
            posthead = (post.getElementsByClassName('posthead'))[0];
            cl = posthead.getAttribute('class');
            postclass = cl.split(/ /);
            if( postclass[1] == "del" ) {
                continue;
            }
            postdetails = (post.getElementsByClassName('postdetails'))[0];
            postfoot = (post.getElementsByClassName('postfoot'))[0];
            
            if( newdayflag ) {
                postdetails.style.display = "block";
                postfoot.style.display = "block";
                posthead.className = "posthead block " + i;
            } else {
                postdetails.style.display = "none";
                postfoot.style.display = "none";
                posthead.className = "posthead none " + i;
            }
        }
    }
}


