function formatDate(){

    moment.locale("zh-cn");
    $("[data-p='date']").each(function(){
        var p = moment($(this).html());
        $(this).html( p.format("YYYY-MM-DD HH:mm"));

    });
    $("[data-p='date-l']").each(function(){
        var p = moment($(this).html());
        $(this).html( p.format("YYYY-MM-DD HH:mm:ss"));

    });
}


function spectoAjax(options, isjsonpost) {
    var newOptions = $.extend({
        processData: false
    }, options);

    if (isjsonpost) {
        newOptions.contentType = "application/json";
        newOptions.dataType = "json";
        newOptions.processData = false;
        newOptions.type = "post";
        if (typeof(newOptions.data) == "object") {
            newOptions.data = JSON.stringify(options.data);
        }

    }
    $.ajax(newOptions);

}