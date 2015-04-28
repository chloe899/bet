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