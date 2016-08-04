var s = document.createElement('script');
s.src = chrome.extension.getURL('vk_inject.js');
s.onload = function() {
    this.remove();
};
(document.head || document.documentElement).appendChild(s);

var i = document.createElement('script');
i.src = chrome.extension.getURL('libs.js');
i.onload = function() {
    this.remove();
};
(document.head || document.documentElement).appendChild(i);
