const $$ = function (e) {
    var el = document.querySelectorAll(e);
    if (e.indexOf("#") === 0) {
        return el[0];
    } else {
        return el;
    }
}

let studyMemory = {};
let studyNowVal = null;
let testMemory = {};
let testNowVal = null;
let nowMode = null;
let nowWord = null;

const mytap = "click";

window.onload = function () {
    meSpeak.loadConfig("./component/meSpeak/mespeak_config.json");
    meSpeak.loadVoice("./component/meSpeak/voices/en/en-us.json");
    $$("#loader").className = "hide";

    //AddEventListener
    $$("#startStudy").addEventListener(mytap, function () {
        els.speak("start to learn words.", function () {
            els.study.start();
        });
    });

    $$("#startTest").addEventListener(mytap, function () {
        els.speak("start to test your word vocabularies.", function(){
            els.test.start();
        });
    });

    $$("#speakText").addEventListener("keyup", function (e) {
        if (e.target.value == "") {
            $$("#speakStates").innerHTML = '<i class="fas fa-volume-mute"></i>';
        } else {
            $$("#speakStates").innerHTML = '<i class="fas fa-play"></i>';
        }
    });

    $$("#speakStates").addEventListener(mytap, function () {
        if (typeof els.talk !== "undefined") {
            meSpeak.stop(els.talk);
            els.talk = undefined;
        } else {
            var panelStates = $$("#speakPanel").className;
            if (panelStates == "" && $$("#speakText").value == "") {
                $$("#speakPanel").className = "hide";
            } else if(nowMode === "test" && nowWord !== null){
                els.speak(nowWord);
            }else if (panelStates == "hide" && $$("#speakText").value == "" && $$("#studyTest").style.display == "block" && $$("#studyTestWord").value != "") {
                els.speak($$("#studyTestWord").value);
            } else if (panelStates == "" && $$("#speakText").value !== "") {
                $$("#speakText").readOnly = true;
                els.speak($$("#speakText").value, function () {
                    $$("#speakText").value = "";
                    $$("#speakText").readOnly = false;
                });
            } else {
                $$("#speakPanel").className = "";
            }
        }
    });
    
    $$("#studyTestWord").addEventListener("keyup", function(e){
       if(e.keyCode === 13){
           $$("#nextButton").click();
       } 
    });

    els.speak("Select mode and push button.")
}

let els = {
    "speak": function (text, callBackFn) {
        if (typeof els.talk !== "undefined") {
            meSpeak.stop(els.talk);
            els.talk = undefined;
        }

        if (callBackFn) {
            els.callBackFn = callBackFn;
        } else {
            els.callBackFn = undefined;
        }
        $$("#speakStates").innerHTML = '<i class="fas fa-spinner"></i>';
        setTimeout(function () {
            $$("#speakText").value = text;
            $$("#speakText").readOnly = true;
            els.talk = meSpeak.speak(text, {
                "variant": "f5",
                "speed": 130
            }, els.speakEnd);
            $$("#speakStates").innerHTML = '<i class="fas fa-volume-up"></i>';
        }, 250);

    },
    "speakEnd": function () {
        $$("#speakStates").innerHTML = '<i class="fas fa-volume-mute"></i>';
        $$("#speakText").readOnly = false;
        $$("#speakText").value = "";
        if (els.callBackFn) {
            els.callBackFn();
            els.callBackFn = undefined;
        }

    },
    "study": {
        "start": function () {
            nowMode = "study";
            $$("#nextButton").addEventListener("click", els.study.next);
            $$("#speakPanel").className = "hide";
            if (typeof localStorage.studyMemory != "undefined" && typeof textList[localStorage.studyMemory] !== "undefined") {
                var textListNum = parseInt(localStorage.studyMemory);
                els.fileLoad(textList[textListNum], function (json) {
                    studyMemory = json;
                    els.study.next();
                    localStorage.studyMemory = textListNum;
                });
            } else {
                els.fileLoad(textList[0], function (json) {
                    studyMemory = json;
                    els.study.next();
                    localStorage.studyMemory = 0;
                });
            }
        },
        "startFromPoint": function (num) {
            els.fileLoad(textList[num], function (json) {
                studyMemory = json;
                els.study.next();
            });
        },
        "next": function () {
            $$("#nextButton").disabled = true;
            if (studyNowVal === null) {
                studyNowVal = 0;
            } else {
                studyNowVal++;
            }
            var qa = studyMemory.text[studyNowVal];
            if (typeof qa == "undefined") {
                alert("You finished studying!");
                $$("#speakPanel").className = "";
                $$("#studyTest").style.display = "none";
                $$("#nextButton").removeEventListener("click", els.study.next);
                studyNowVal = null;
                localStorage.studyMemory = parseInt(localStorage.studyMemory) + 1;
                return false;
            }
            $$("#studyTest").style.display = "block";
            $$("#wordImage").src = "./content/image/" + qa.image;
            $$("#studyTestWord").value = qa.word;
            els.speak(qa.word, function () {
                $$("#nextButton").disabled = false;
            });
        },
        "exit": function () {
            studyNowVal = null;
            nowMode = null;
            $$("#nextButton").removeEventListener("click", els.study.next);
            $$("#studyTest").style.display = "none";
            $$("#speakPanel").className = "";
        }
    },
    "test": {
        "start": function () {
            nowMode = "test";
            $$("#nextButton").addEventListener("click", els.test.check);
            $$("#speakPanel").className = "hide";
            if (typeof localStorage.testMemory != "undefined" && typeof textList[localStorage.testMemory] !== "undefined") {
                var textListNum = parseInt(localStorage.testMemory);
                els.fileLoad(textList[textListNum], function (json) {
                    testMemory = json;
                    els.test.next();
                    localStorage.testMemory = textListNum;
                });
            } else {
                els.fileLoad(textList[0], function (json) {
                    testMemory = json;
                    els.test.next();
                    localStorage.testMemory = 0;
                });
            }
        },
        "next": function () {
            $$("#nextButton").disabled = true;
            $$("#studyTestWord").value = "";            
            $$("#studyTestWord").blur();
            if (testNowVal === null) {
                testNowVal = 0;
            } else {
                testNowVal++;
            }
            var qa = testMemory.text[testNowVal];
            if (typeof qa == "undefined") {
                alert("You finished testing!");
                $$("#speakPanel").className = "";
                $$("#studyTest").style.display = "none";
                $$("#nextButton").removeEventListener("click", els.test.check);
                testNowVal = null;
                localStorage.testMemory = parseInt(localStorage.testMemory) + 1;
                return false;
            }
            $$("#studyTest").style.display = "block";
            $$("#wordImage").src = "./content/image/" + qa.image;
            //$$("#studyTestWord").value = qa.word;
            nowWord = qa.word;
            els.speak(qa.word, function () {
                $$("#nextButton").disabled = false;
                $$("#studyTestWord").focus();
            });
        },
        "check":function(){
            if($$("#studyTestWord").value === nowWord){
                $$("#studyTestWord").value = "○";
                setTimeout(function(){
                    els.test.next();
                },500);
                
            }else{
                $$("#studyTestWord").value = "×"
                els.speak(nowWord, function(){
                    $$("#studyTestWord").focus();
                    $$("#studyTestWord").value = "";
                });
            }
        },
        "exit": function () {

        }
    },
    "fileLoad": function (num, onloadEvent) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', "./content/text/" + num + ".json", true);
        xhr.onreadystatechange = function () {
            // 本番用
            if (xhr.readyState === 4 && xhr.status === 200) {
                var json = JSON.parse(xhr.responseText);
                onloadEvent(json);
            }
            // ローカルファイル用
            if (xhr.readyState === 4 && xhr.status === 0) {
                var json = JSON.parse(xhr.responseText);
                onloadEvent(json);
            }
        };
        xhr.send(null);
    }
}
