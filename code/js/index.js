/*
 * ---------------------------------------------
 * website:
 * filename: index.js
 * revision: 1.0
 * createdate: 2015-04-27
 * author: lc
 * description: 
 * ---------------------------------------------
 */
/*页面执行*/
$(function(){
    var pageTransition = BASE.COM.pageTransition.init('#pt-main', {
        callback: function(self){
            console.log(self);
        }
    });

    //测试代码
    var $button = $('button');
    $button.on('tap', function(e){
        e.preventDefault();
        var p = $(this).attr('data-page');
        pageTransition.showPage(p);
        return false;
    })

});


