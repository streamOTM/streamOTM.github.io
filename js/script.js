$(function() {

    var dvLogin = '#dvLogin';
    var dvLoading = '#dvLoading';
    var btnStartQuiz = '#start-quiz';
    var sectionVideoStream = '#sectionVideoStream';
    var video_out  = document.getElementById("videoStream");
    var headerQuiz = '#headerQuiz';
    var sectionStart = '#sectionStart';
    var dvInfo = '#dvInfo';
    var sectionInfo = '#sectionInfo';
    var imgSlide = '#imgSlide';
    var footer = '#footer';
    var sectionAnswers = '#sectionAnswers';
    var countDownSlide = '#countDownSlide';
    var sectionGamer = '#sectionGamer';
    var scoreboardResult = '#scoreboardResult';
    var sectionScoreboard = '#sectionScoreboard';
    var counter = 0, channel,codeSite,codeEvent,streamName,classroom,nickname,countAnimator=0;
    var pointSlides = 1000;
    var countInterval;
    var IntervalNum = 5;
    var totalQ = 4;

    var src1 = './images/cat1.jpg';
    var src2 = './images/cat2.jpg';
    var src3 = './images/cat3.jpg';
    var src4 = './images/cat4.jpg';
    var images =  [src1, src2, src3, src4];

    var totalAnswers = 4;
    var correctAnswers = ['1','3','4','2'];
    var arrayUsersAndPoints = [];
    var arrayClassroomAndPoints = [];

    //var arrayClassroomElement = [];

    for (var i = 0; i <= 5; i++) {
        arrayUsersAndPoints.push({
            name: 'Student '+i,
            point: 998+i
        });
    }

    for (var i = 0; i <= 2; i++) {
        arrayClassroomAndPoints.push({
            name: 'Class '+i,
            point: 3998+i
        });
    }

    var titlesQuestions = ["Title question 1","Title question 2","Title question 3","Title question 4"];


    /*---------------------------------------------Action launch--------------------------------------------------*/
    $('button#launch').click(function () {
        channel = Math.floor(Math.random() * 99999 + 1);
        codeSite = $('#code-site').val();
        codeEvent = $('#code-event').val();
        $(dvLogin).hide('slow', function(){ $(dvLogin).remove(); });
        $(dvLoading).removeClass('divHide', 1000, "easeInBack");
        /*var url ='http://localhost/monProjet/wp-json/wp/v2/media?parent='+codeEvent;
         $.getJSON(url, function(result){
            $.each(result, function(i, field){
                if(field.media_type == 'image'){
                    images[i] = field.source_url;
                }
            });
         });*/
        errWrap(stream, $(this));
    });
    /*----------------------------------------------------ANIMATOR JOINT--------------------------------------------------*/
    $('button#joint-stream-animators').click(function() {
        streamName = $('#code-channel').val();
        classroom = $('#classroom').val();
        nickname = $('#nickname').val();
        $(dvLogin).hide('slow', function(){ $(dvLogin).remove(); });
        $(dvLoading).removeClass('divHide', 1000, "easeInBack");
        errWrap(watch, $(this));
    });

    /*--------------------------------------------------Start Event Quiz---------------------------------------------*/
    $(btnStartQuiz).click(function(){

        var object = 'MY OBJECT';
        var nm = counter+1;
        var data = {
            event: 'firstStart',
            object: object,
            totalQuestion: totalQ
        };
        phone.pubnub.publish({
            channel: channel + '-stream',
            message: data,
            callback: function (m) {
                firstStart(object, totalQ);
                $(footer).addClass('hidden');

            }
        });


        setTimeout(function() {

            var data = {
                event: 'secondStart',
                numQuestion: nm,
                totalQuestion: totalQ,
                titleQuestion: titlesQuestions[counter],


                counter : counter,
                totalAnswers: totalAnswers,
                correctAnswer : correctAnswers[counter],
                pointSlides : pointSlides
            };

            console.log(data);
            phone.pubnub.publish({
                channel: channel + '-stream',
                message: data,
                callback: function (m) {

                    secondStart(nm,totalQ,titlesQuestions[counter],counter,totalAnswers,correctAnswers[counter],pointSlides);
                    $(footer).removeClass('hidden');
                }
            });

        },4000);

        setTimeout(function() {


            var data = {
                event: 'thirdStart',
                titleQuestion: titlesQuestions[counter],
                intervalNum : IntervalNum
            };

            phone.pubnub.publish({
                channel: channel + '-stream',
                message: data,
                callback: function (m) {
                    //console.log(m[1]);
                    thirdStart(titlesQuestions[counter]);
                    $('#dvNext').removeClass('hidden');

                    $(countDownSlide).html(''+IntervalNum);
                    countInterval = setInterval(function() {
                        $(countDownSlide).each(function () {
                            //var count = parseInt($(this).html());
                            var count = IntervalNum;
                            if (count !== 0) {
                                $(this).html(count - 1);
                                IntervalNum--;
                            }else{
                                clearInterval(countInterval);
                                var data = {
                                    event: 'showCorrectAnswer',
                                    totalAnswers: 4,
                                    correctAnswer : 1
                                };
                                phone.pubnub.publish({
                                    channel: channel + '-stream',
                                    message: data,
                                    callback: function (m) {
                                        generateCharacteristicAnswers(4);
                                    }
                                });
                            }
                        });
                    }, 1000);
                }
            });
        },8000);
    });

    /*--------------------------------------------------Next Event Quiz---------------------------------------------*/
    $('button.nextSection').click(function(event){
        var target = $(event.currentTarget);
        var type = target.attr('data-id');
        var data, winner,nameWinner,pointWinner;

        if(type === 'getScoreboardStudent'){

            arrayUsersAndPoints.sort(function(a, b){return b.point - a.point});
            data = {
                event: 'getScoreboardStudent',
                arrayUsersAndPoints: arrayUsersAndPoints
            };
            phone.pubnub.publish({
                channel: channel + '-stream',
                message: data,
                callback: function (m) {

                    target.attr('data-id','getScoreboardClassroom');
                    generateScoreboard('Scoreboard student',arrayUsersAndPoints);

                }
            });
        }

        if(type === 'getScoreboardClassroom'){

            arrayClassroomAndPoints.sort(function(a, b){return b.point - a.point});
            data = {
                event: 'getScoreboardClassroom',
                arrayClassroomAndPoints: arrayClassroomAndPoints
            };

            phone.pubnub.publish({
                channel: channel + '-stream',
                message: data,
                callback: function (m) {
                    target.attr('data-id','nextSlide');
                    generateScoreboard('Scoreboard classroom',arrayClassroomAndPoints);
                }
            });
        }


        if(type === 'nextSlide'){

            counter++;
            IntervalNum = 5;
            var nm = counter+1;

            data = {
                event: 'secondStart',
                numQuestion: nm,
                totalQuestion: totalQ,
                titleQuestion: titlesQuestions[counter],


                counter : counter,
                totalAnswers: totalAnswers,
                correctAnswer : correctAnswers[counter],
                pointSlides : pointSlides
            };
            phone.pubnub.publish({
                channel: channel + '-stream',
                message: data,
                callback: function (m) {


                    if(counter == images.length -1){
                        target.attr('data-id','topStudent');

                    }else{
                        target.attr('data-id','getScoreboardStudent');
                    }

                    secondStart(nm,totalQ,titlesQuestions[counter],counter,totalAnswers,correctAnswers[counter],pointSlides);
                    $('#dvNext').addClass('hidden');
                    $(footer).removeClass('hidden');
                }
            });


            setTimeout(function() {

                var data = {
                    event: 'thirdStart',
                    titleQuestion: titlesQuestions[counter],
                    intervalNum : IntervalNum
                };

                phone.pubnub.publish({
                    channel: channel + '-stream',
                    message: data,
                    callback: function (m) {
                        //console.log(m[1]);
                        thirdStart(titlesQuestions[counter]);
                        $('#dvNext').removeClass('hidden');

                        $(countDownSlide).html(''+IntervalNum);
                        countInterval = setInterval(function() {
                            $(countDownSlide).each(function () {
                                //var count = parseInt($(this).html());
                                var count = IntervalNum;
                                if (count !== 0) {
                                    $(this).html(count - 1);
                                    IntervalNum--;
                                }else{
                                    clearInterval(countInterval);
                                    var data = {
                                        event: 'showCorrectAnswer',
                                        totalAnswers: 4,
                                        correctAnswer : 1
                                    };
                                    phone.pubnub.publish({
                                        channel: channel + '-stream',
                                        message: data,
                                        callback: function (m) {

                                            generateCharacteristicAnswers(4);
                                        }
                                    });
                                }
                            });
                        }, 1000);
                    }
                });
            },4000);
            /*if(counter == images.length -1){
                $(this).attr('disabled','disabled');

            }*/
        }



        if(type === 'topStudent'){
            winner = getHighest(arrayUsersAndPoints);
            nameWinner = winner['name'];
            pointWinner = winner['point'];
            data = {
                event: 'topStudent',
                nameWinner: nameWinner,
                pointWinner: pointWinner
            };

            phone.pubnub.publish({
                channel: channel + '-stream',
                message: data,
                callback: function (m) {
                    target.attr('data-id','topClassroom');
                    getWinner(nameWinner,pointWinner,'Top student');
                }
            });
        }



        if(type === 'topClassroom'){
            winner = getHighest(arrayClassroomAndPoints);
            nameWinner = winner['name'];
            pointWinner = winner['point'];
            data = {
                event: 'topClassroom',
                nameWinner: nameWinner,
                pointWinner: pointWinner
            };

            phone.pubnub.publish({
                channel: channel + '-stream',
                message: data,
                callback: function (m) {
                    target.hide(300);
                    $('#getResult').removeClass('hidden');
                    getWinner(nameWinner,pointWinner,'Top classroom');
                }
            });
        }




    });


    $('#getResult').click(function(){
        var data = {
            event: 'rateQuiz'
        };

        phone.pubnub.publish({
            channel: channel + '-stream',
            message: data,
            callback: function (m) {
                $('#getResult').hide(300);
                $('#finalResult').removeClass('hidden')
                rateQuiz();
            }
        });
    });



    $('.finalResult').click(function(event){

        var target = $(event.currentTarget);
        var type = target.attr('data-id');
        var data;
        if(type === 'finalScoreboardStudent'){
            arrayUsersAndPoints.sort(function(a, b){return b.point - a.point});
            data = {
                event: 'finalScoreboardStudent',
                arrayUsersAndPoints: arrayUsersAndPoints
            };
            phone.pubnub.publish({
                channel: channel + '-stream',
                message: data,
                callback: function (m) {

                    target.attr('data-id','finalScoreboardClassroom');
                    target.text('Next final result');
                    generateScoreboard('Final Scoreboard student',arrayUsersAndPoints);

                }
            });
        }

        if(type === 'finalScoreboardClassroom'){

            arrayClassroomAndPoints.sort(function(a, b){return b.point - a.point});
            data = {
                event: 'finalScoreboardClassroom',
                arrayClassroomAndPoints: arrayClassroomAndPoints
            };

            phone.pubnub.publish({
                channel: channel + '-stream',
                message: data,
                callback: function (m) {
                    target.addClass('hidden');
                    $('#saveResult').removeClass('hidden');
                    generateScoreboard('Final Scoreboard classroom',arrayClassroomAndPoints);
                }
            });
        }
    });


    $('#end-stream').click(function(){
        end();
    });


    function stream() {
        streamName = channel+'';
        var phone = window.phone = PHONE({
            number        : streamName, // listen on username line else random
            publish_key   : 'pub-c-8e45f540-691c-4e55-9f07-f2278795ec3d', // Your Pub Key
            subscribe_key : 'sub-c-b5732f80-4ccf-11e6-8b3b-02ee2ddab7fe', // Your Sub Key
            uuid : streamName,
            oneway        : true,
            broadcast     : true,
        });

        var ctrl = window.ctrl = CONTROLLER(phone, get_xirsys_servers);
        ctrl.ready(function(){
            ctrl.addLocalStream(video_out);
            ctrl.stream();

            phone.pubnub.state({
                channel  : streamName+'-stream',
                state    : {
                    "eventId" : codeEvent
                },
                callback : function(m){
                    $(btnStartQuiz).removeClass('hidden');
                    showClassroomJoined(streamName,'is you code pin');
                    $(footer).show(300);

                },
                error    : function(m){
                    //console.log(m)
                    alert('ERROR'+m);
                    window.location.reload();
                }
            });

        });
        ctrl.receive(function(session){
            session.connected(function(session){ console.log(session.number + " has joined."); });
            session.ended(function(session) { console.log(session.number + " has left."); console.log(session)});
        });
        ctrl.streamPresence(function(m){
            console.log(m);

            var classrm = m.uuid;

            if(classrm.includes('-classroom')){
                countAnimator++;
                classrm = classrm.replace('-classroom','');
                var nicknam = m.data['nickname'];
                getJoinedClassroom(classrm, nicknam,countAnimator);
                $(footer).hide(300);
                $(btnStartQuiz).removeAttr('disabled');
                $(btnStartQuiz).removeClass('btn-default').addClass('btn-primary');
            }else{
                //console.log('noooooooooo');
            }

        });
        ctrl.streamReceive(function(m){
            //console.log(m);

        });
        return false;
    }

    function watch(){
        var num = streamName;
        var phone = window.phone = PHONE({
            number        : "Viewer" + Math.floor(Math.random()*100), // listen on username line else random
            publish_key   : 'pub-c-8e45f540-691c-4e55-9f07-f2278795ec3d', // Your Pub Key
            subscribe_key : 'sub-c-b5732f80-4ccf-11e6-8b3b-02ee2ddab7fe', // Your Sub Key
            uuid          : classroom+'-classroom',
            oneway        : true
        });
        var ctrl = window.ctrl = CONTROLLER(phone, get_xirsys_servers);
        ctrl.ready(function(){
            ctrl.isStreaming(num, function(isOn){
                if (isOn){
                    //console.log(isOn);

                    ctrl.isClassroomExist(num,classroom+'-classroom',function(isExist){
                        console.log(isExist);
                        if(isExist == -1){
                            ctrl.joinStream(num,nickname);
                        }
                        else{
                            alert("Classroom Exist!");
                            window.location.reload();
                        }
                    });
                }
                else{ alert("User is not streaming!");
                    window.location.reload();}
            });
            //console.log("Joining stream  " + num);
            // Get state by uuid.
            /*phone.pubnub.state({
             channel  : num+'-stream',
             uuid     : num,
             callback : function(m){

             var url ='http://localhost/monProjet/wp-json/wp/v2/media?parent='+m.eventId;
             $.getJSON(url, function(result) {
             $.each(result, function (i, field) {
             if (field.media_type == 'image') {
             images[i] = field.source_url;
             }
             });
             });
             },
             error    : function(m){
             alert('ERROR'+m);
             }
             });*/
        });
        ctrl.receive(function(session){
            session.connected(function(session){
                video_out.appendChild(session.video);
                // console.log(session.number + " has joined.");
                showClassroomJoined(streamName,'is joined');

            });

            session.ended(function(session) { console.log(session.number + " has left."); });
        });
        ctrl.streamPresence(function(m){
            console.log(m);
            var classrm = m.uuid;

            if(classrm.includes('-classroom')){
                //classrm = classrm.replace('-classroom','');


                phone.pubnub.state({
                    channel  : num+'-stream',
                    uuid     : classrm,
                    callback : function(m){
                        //console.log(m.nickname);
                        countAnimator++;
                        classrm = classrm.replace('-classroom','');
                        var nicknam = m.nickname;
                        getJoinedClassroom(classrm, nicknam,countAnimator);
                    },
                    error    : function(m){
                        alert('ERROR'+m);
                    }
                });


            }else{
                //console.log('noooooooooo');
            }
        });


        ctrl.streamReceive(function(m){
            //console.log(m);
            switch(m.event){

                case 'firstStart':
                    firstStart(m.object, m.totalQuestion);
                    break;

                case 'secondStart':
                    secondStart(m.numQuestion, m.totalQuestion, m.titleQuestion,m.counter,m.totalAnswers, m.correctAnswer, m.pointSlides);
                    break;

                case 'thirdStart':
                    thirdStart(m.titleQuestion);
                    IntervalNum = m.intervalNum;
                    $(countDownSlide).html(''+IntervalNum);
                    countInterval = setInterval(function() {
                        $(countDownSlide).each(function () {
                            var count = IntervalNum;
                            if (count !== 0) {
                                $(this).html(count - 1);
                                IntervalNum--;
                            }else{
                                clearInterval(countInterval);
                            }
                        });
                    }, 1000);
                    break;

                case 'showCorrectAnswer':
                    generateCharacteristicAnswers(m.totalAnswers);
                    break;

                case 'getScoreboardStudent':
                    generateScoreboard('Scoreboard student',m.arrayUsersAndPoints);
                    break;

                case 'getScoreboardClassroom':
                    generateScoreboard('Scoreboard classroom',m.arrayClassroomAndPoints);
                    break;

                case 'topStudent':
                    getWinner(m.nameWinner, m.pointWinner,'Top student');

                    break;
                case 'topClassroom':
                    getWinner(m.nameWinner, m.pointWinner,'Top classroom');

                    break;

                case 'rateQuiz':
                    rateQuiz();

                    break;

                case 'finalScoreboardStudent':
                    generateScoreboard('Final Scoreboard student',m.arrayUsersAndPoints);
                    break;

                case 'finalScoreboardClassroom':
                    generateScoreboard('Final Scoreboard classroom',m.arrayClassroomAndPoints);

                    break;

            }
        });

        return false;
    }


    function showClassroomJoined(streamName,action){
        $(headerQuiz).html('<h1>'+streamName+'</h1><h3>'+action+'</h3>');
        $(dvLoading).hide('slow', function(){ $(dvLoading).remove(); });
        $('.divHide').show(300);
        $('body').removeClass('bg-green').addClass('bg-black');
    }

    function firstStart(object,totalQuestions){
        $(sectionVideoStream).addClass('hidden');
        $('body').removeClass('bg-black').addClass('bg-grey');
        $(headerQuiz).html('<h1>'+object+'</h1>');
        $(headerQuiz).removeClass('navbar-custom-opacity').addClass('navbar-custom');
        $(sectionStart).hide('slow', function(){ $(sectionStart).remove(); });
        $(sectionInfo).removeClass('hidden');
        $(dvInfo).html('<h1>'+totalQuestions+' questions</h1><h1>Are you ready</h1>');

        starProgressBar(3500);

    }

    function secondStart(numQuestion,totalQuestions,titleQuestion,counter,totalAnswers,correctAnsw,pointSlides){

        if(counter !=0){
            $(sectionVideoStream).addClass('hidden');
            $(sectionGamer).addClass('hidden');
            $(sectionScoreboard).addClass('hidden');
            $(sectionInfo).removeClass('hidden');
            $(imgSlide).show();
            $('#scoreboard-content').hide();
            
            
          
            $('body').removeClass('bg-black').addClass('bg-grey');
      
            $(sectionStart).hide('slow', function(){ $(sectionStart).remove(); });
            $(sectionInfo).removeClass('hidden');
        }


        starProgressBar(3500);
        $(sectionVideoStream).addClass('hidden');
        $(imgSlide).html('<img class="imgSlides" src="'+images[counter]+'" >');
        $(headerQuiz).html('<h1>Question '+numQuestion+' of '+totalQuestions+'</h1>');
        $(dvInfo).html('<h1>'+titleQuestion+'</h1>');
        $(footer).html('<h2 class="text-center">Win app to '+pointSlides+' points!</h2>');
        $(sectionAnswers).html('');
        for(var i=1;i<=totalAnswers;i++){
            if(i == correctAnsw) {
                $(sectionAnswers).append('<div class="col-xs-6 content-answer">' +
                    '<div class="answer-broadcaster answer-' + i + '">' +
                    '<h3 style="color: #ffffff">Answer ' + i +
                        '<span id="correctAnswer" class="glyphicon glyphicon-check pull-right"></span>' +
                    '</h3></div></div>');
            }else{
                $(sectionAnswers).append('<div class="watchOpacity content-answer col-xs-6">' +
                    '<div class="answer-broadcaster answer-' + i + '">' +
                    '<h3 style="color: #ffffff">Answer ' + i + '</h3></div></div>');
            }
        }
    }


    function thirdStart(titleQuestion){
        $(footer).addClass('hidden');
        $(headerQuiz).html('<h1>'+titleQuestion+'</h1>');
        $(sectionInfo).addClass('hidden');
        $(sectionGamer).removeClass('hidden');
    }

    function generateCharacteristicAnswers(totalAnswers){
        $('#scoreboard-content').html('');
        $('div.watchOpacity').css('opacity','0.2');
        $('span#correctAnswer').show(300);

        setTimeout(function(){
            $(imgSlide).hide(100);
            for(var i=1;i<=totalAnswers;i++){
                $('div#scoreboard-content').append('<div class="col-xs-3 text-center answer-'+i+
                    '" style="color: #ffffff ;border: 2px solid #ffffff">'+i+'</div>');
            }
            $('#scoreboard-content').show(300);
        },1500);

    }


    function generateScoreboard(title,arrayUsersAndPoints){
        $(sectionVideoStream).removeClass('hidden');
        clearInterval(countInterval);
        $(scoreboardResult).html('');
        $(headerQuiz).html('<h1>'+title+'</h1>');
        $(sectionGamer).addClass('hidden');
        $(sectionScoreboard).removeClass('hidden');
        $('#rateQuiz').addClass('hidden');

        $.each(arrayUsersAndPoints,function(index,value){
            $(scoreboardResult).append('<div class="col-sm-12 scoreboardList">' +
                '<span class="nameStudent pull-left">'+value.name+'</span>' +
                '<span class="nameStudent pull-right">'+value.point+'</span></div>')
        });

    }

    function getWinner(name,point,title){

        clearInterval(countInterval);
        $(headerQuiz).html('<h1>'+title+'</h1>');
        $(sectionGamer).addClass('hidden');
        $(sectionScoreboard).removeClass('hidden');
        $(scoreboardResult).html('<h1 class="winner">'+name+'</h1><h3>with '+point+ ' points</h3>');
    }

    function getJoinedClassroom(classrom,animator,countAnimator){
        $('#classroomOccupancy').text(''+countAnimator);
        $('div#teamContent').append('<div class="col-xs-6 col-sm-4 teams">'+
            '<div class="nameClassroom">'+
                '<h2>'+classrom+'</h2>'+
                '<h3>'+animator+'</h3>'+
            '</div>'+
            '<div class="namesPlayers">'+
            '<ul class="csv">'+
                '<li>user1</li>'+
                '<li>user2</li>'+
                '<li>user3</li>'+
            '</ul></div> </div>');
    }

    function rateQuiz(){
        $(headerQuiz).html('<h1>Rate this quiz</h1>');
        $(sectionScoreboard).addClass('hidden');
        $('#rateQuiz').removeClass('hidden');
    }

    function getHighest(array) {
        var max = {};
        for (var i = 0; i < array.length; i++) {
            if (array[i].point > (max.point || 0))
                max = array[i];
        }
        return max;
    }

    function starProgressBar(totalTime) {
        var elem = document.getElementById("progressBar");
        var width = 0;
        elem.style.width = '0%';
        var id = setInterval(frame, 10);
        function frame() {
            if (width >= 100) {
                clearInterval(id);
            } else {
                width = width+(1000/totalTime);
                elem.style.width = width + '%';
                //console.log(width);
            }
        }
    }

    function end(){
        if (!window.phone) return;
        ctrl.hangup();
        video_out.innerHTML = "";
    }

    function errWrap(fxn, form){
        try {
            return fxn(form);
        } catch(err) {
            alert("WebRTC is currently only supported by Chrome, Opera, and Firefox");
            return false;
        }
    }

    /*-----------------------------------------------------------------------------------*/
    function get_xirsys_servers() {
        var servers;
        /*$.ajax({
         type: 'POST',
         url: 'https://service.xirsys.com/ice',
         data: {
         room: 'default',
         application: 'default',
         domain: 'kevingleason.me',
         ident: 'gleasonk',
         secret: 'b9066b5e-1f75-11e5-866a-c400956a1e19',
         secure: 1,
         },
         success: function(res) {
         console.log(res);
         res = JSON.parse(res);
         if (!res.e) servers = res.d.iceServers;
         },
         async: false
         });
         return servers;*/
    }



});
