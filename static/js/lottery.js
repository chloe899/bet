(function(){

    $(document).ready(function(){


        function render(){




            var data = getData();
            var matchCount = data.matchCount;
            $("#SelMatchCount").html(matchCount);
            if(matchCount < 2){
                $("#BetHint").removeClass("hidden");
                $("#PassType").addClass("hidden");
            }else{
                $("#BetHint").addClass("hidden");
                $("#PassType").removeClass("hidden");

                $("#PassType li").each(function(i){
                    if(i >= (matchCount - 1) ){
                        $(this).addClass("hidden");
                    } else{
                        $(this).removeClass("hidden");
                    }
                });
                var resultArr = [];
                $("#PassType input:checked").each(function(){
                    var type = $(this).data("type");
                    console.log(type);
                   resultArr =  resultArr.concat(genDetail(type));

                });
                console.log()
                $("#BetCount").html(resultArr.length);
                var min = 0;
                var max = 0;
                _.each(resultArr, function(item){
                    var r = 1;
                    _.each(item, function(subItem){

                        r  = r * subItem.rate;
                    });

                    if(!min){
                      min = r;
                    }
                    if(r > max){
                        max = r;
                    }
                    if(r < min){
                        min = r;
                    }

                });
                $("#BetAward").html(min + "-----" + max);

            }



        }

        function genDetail(type){

            var rateMap = {};

            $(".rate.active").each(function(){

                var matchId =  $(this).parents("tr").data("match-id");
                var arr =  rateMap[matchId]  || [];
                var tempItem = {};
                tempItem.result = $(this).data("r");
                tempItem.rate = $(this).html();
                tempItem.matchId = matchId;
                tempItem.ball = $(this).parent().prev().html();
                arr.push(tempItem);
                rateMap[matchId] = arr;



            });


            var tempList = _.values(rateMap);
            var arr = [];
            for(var i = 0; i < tempList.length; i++){
                if(i < type){
                    arr[i] = 1;
                }else{
                    arr[i] = 0;
                }

            }
            //console.log(arr);

            var listArr = doGen(arr, type, tempList);
            return listArr;


        }
        function swap(arr,index1, index2){
            // console.log("do swap");
            // console.log(arr);
            var a = arr[index1];
            var b = arr[index2];
            arr[index1] = b;
            arr[index2] = a;
            //console.log(arr);


        }

        function sort(arr,i){


            var arr1 = arr.slice(0,i);
            var arr2 = arr.slice(i);
            arr1.sort(function(a,b){
                return a < b;
            });
            arr = arr1.concat(arr2);
            return arr;

        }

        function printResult(arr, list){
            //console.log(arr);

            var tempArr = [];
            var max = 1;
            var total = 1;
            for(var i = 0; i < arr.length; ++i){
                if(arr[i] == 1){
                    total = list[i].length * total;
                    tempArr.push(list[i]);
                }
            }


            var resultArr = [];

            _.each(tempArr, function(item, i){

                var subArr = tempArr[i];


                if(i != tempArr.length -1){

                    for(var j = 0; j < subArr.length; j++){
                        var end = total / subArr.length;
                        for(var k = j * end; k < (j+1) * end; k++){
                            resultArr[k] = resultArr[k] || [];
                            resultArr[k][i] = subArr[j];
                        }

                    }
                }else{
                    (function(){

                        var len =  subArr.length; //3
                        var end = total / len;  // 4

                        for(var k = 0;k < end; k++)
                        {
                            for(var j = 0; j < len; j++){
                                var idx = k * len + j;
                                resultArr[idx] = resultArr[idx] || [];
                                resultArr[idx][i] = subArr[j];

                            }


                        }

                    })();
                }





            });

            return resultArr;




        }

        function doGen(vecInt,total, list){

            total = vecInt.length;
            var arr = vecInt;
            var resultArr = [];
            resultArr.push(printResult(vecInt, list));
            var times = 0;
            var start = 0;

            for(var  i = 0; i < total - 1; ++i){
                console.log("before:",JSON.stringify(arr));
                console.log("i is:",i);

                if(vecInt[i] == 1 && vecInt[i+1] == 0){
                    //1. first exchange 1 and 0 to 0 1

                    swap(arr, i, i+1);

                    if(times > 10){
                        break;
                    }
                    times ++;
                    //2.move all 1 before vecInt[i] to left
                    console.log("before sort",JSON.stringify(arr));
                    arr =  sort(arr,i);
                    console.log("after sort",JSON.stringify(arr));

                    //after step 1 and 2, a new combination is exist
                    var result =  printResult(vecInt, list);
                    resultArr.push(result);
                    //try do step 1 and 2 from front
                    i = -1;
                    console.log("in i is:",i);
                    start++;
                    vecInt = arr;
                }
            }
            //console.log("after sort",JSON.stringify(resultArr));
            var finalResult = [];
            function show(item){
                console.log(typeof(item[0]));
                if(_.isArray(item) && _.isArray(item[0])){
                    _.each(item, function(item){
                        show(item);
                    });
                }else{

                        console.log("result is ",JSON.stringify(item));
                    finalResult.push(item);
                }

            }
            show(resultArr);

            return finalResult;
            //console.log("times is :" ,times);

        }


        function getData(){
            var data = {};

            var matchArr = $(".rate.active").map(function(){

                return $(this).parents("tr").data("match-id");


            });

            matchArr = _.uniq(matchArr);
            data.matchCount = matchArr.length;
            return data;



        }



        $(".rate").on("click", function(){
            var me = $(this);
            var cName = "active";
            if(me.hasClass(cName)){
                me.removeClass(cName);
            }else{
                me.addClass(cName);
            }

            render();

        });

        $("#PassType input[type='checkbox']").on("click", function(){

            render();

        });


    });






})();