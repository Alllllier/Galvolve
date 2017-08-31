(function () {
    var scene = 0; // 当前场景
    var data; // JSON 数据
    var onType = false; // 是否在打字机效果
    var auto = false; // 是否在自动播放
    var typeInterval; // 打字机效果的interval id
    var autoTimeout; // 自动播放的timeout id
    var historyOn = false; // 历史窗口是否打开
    var dialogOn = true; // 对话框是否打开

    $(document).ready(function () {
        $.get('json/data.json', function (json) {
            data = json;
        });
        $('.dialog').click(function () {
            if (!auto) {
                nextScene();
            }
        });
        $('.save-button').click(function (e) {
            e.stopPropagation();
            saveScene();
        });
        $('.load-button').click(function (e) {
            e.stopPropagation();
            loadScene();
        });
        $('.history-button').click(function (e) {
           e.stopPropagation();
           toggleHistory();
        });
        $('.auto-button').click(function (e) {
            e.stopPropagation();
            autoPlay();
        });
        $('.hide-button').click(function (e) {
            e.stopPropagation();
            toggleDialog();
        });
        fixBgRatio();

        // 键盘事件
        // 空格：开启关闭对话框
        // 回车：下一场景
        $(document).keyup(function(event){
            switch (event.keyCode) {
                case 13:
                    if (!auto) {
                        nextScene();
                    }
                    break;
                case 32:
                    toggleDialog();
            }

        });
    });

    // todo preload figures and bgi in the next scene
    function preloadImg() {

    }

    // todo preload audio and bgm in the next scene
    function preloadAudio() {
        if (scene < data.length) { // if has audio file to be loaded
            // push new loaded audio to audios[]
            // unshift the first(old) one
        }
    }

    // fix background image ratio
    function fixBgRatio() {
        $('.fig-bg').find('img').each(function(){
            var imgClass = (this.width/this.height > 1) ? 'wide' : 'tall';
            $(this).addClass(imgClass);
        });
    }

    // 渲染下一场景
    function nextScene() {
        if (historyOn) {
            $('.history').fadeOut();
            historyOn = false;
        }
        if (!dialogOn) {
            $('.dialog').fadeIn();
            dialogOn = true;
        }
        $('.history-button').removeClass('active');
        if (data) { // if data is loaded todo if img and audio are preload
            if (scene < data.length && !onType) {
                var name = data[scene]['name'].trim();
                var word = data[scene]['word'].trim();
                var bgi = data[scene]['bgi'].trim();
                var figures = data[scene]['figure'];
                $('.dialog .name').text(name);
                $('.fig-bg img').attr('src', 'img/background/' + bgi);
                setFigures(figures);
                typeWord(word);
                addHistory(name, word);
                scene++;
            } else if (scene <= data.length && onType) {
                clearInterval(typeInterval);
                $('.dialog .word').text(data[scene - 1]['word'].trim());
                onType = false;
            }
        }
    }

    // todo 9个存档位
    function saveScene() {
        if (confirm("要保存吗？")) {
            $.cookie('scene', scene - 1, {
                expires: 365
            })
        }
    }

    // todo 从9个存档位中读取
    function loadScene() {
        if ($.cookie('scene')) {
            if (confirm('要读取存档吗')) {

                // auto 重载
                if (auto) {
                    autoPlay();
                }

                scene = $.cookie('scene');
                nextScene();

                // history 重载
                var historyDiv = $('.history');
                historyDiv.html('');
                for (var i = 0; i < scene; i++) {
                    var name = data[i]['name'].trim();
                    var word = data[i]['word'].trim();
                    addHistory(name, word);
                }

                // auto 重载
            }
        } else {
            alert('没有存档');
        }
    }

    // toggle自动播放
    function autoPlay() {
        $('.auto-button').toggleClass('active');
        auto = !auto;
        if (!onType) {
            clearTimeout(autoTimeout);
            if (auto) {
                autoTimeout = setTimeout(nextScene, 1000);
            }
        }
    }

    // toggle 历史窗口
    function toggleHistory() {
        historyOn = !historyOn;
        $('.history-button').toggleClass('active');
        var historyDiv = $('.history');
        historyDiv.fadeToggle();
        historyDiv.scrollTop(historyDiv.prop("scrollHeight"));
    }

    // toggle 对话窗口
    function toggleDialog() {
        if (!dialogOn) {
            $('.dialog').fadeIn();
            dialogOn = true;
        } else {
            if (auto) {
                autoPlay();
            }
            $('.dialog').fadeOut();
            dialogOn = false;
            if (historyOn) {
                $('.history').fadeOut();
                historyOn = false;
                $('.history-button').removeClass('active');
            }
        }
    }

    // 添加对话到历史窗口
    function addHistory(name, word) {
        $('.history').append($('<h1/>', {
            text: name
        }), $('<p/>', {
            text: word
        }));
    }

    // @param {figures} []
    // 渲染figures中的数据
    function setFigures(figures) {
        for (var i = 0; i < figures.length; i++) {
            switch (figures[i]['position']) {
                case '1':
                    $('.fig-left img').attr('src', 'img/figure/' + figures[i]['name']);
                    break;
                case '2':
                    $('.fig-middle img').attr('src', 'img/figure/' + figures[i]['name']);
                    break;
                case '3':
                    $('.fig-right img').attr('src', 'img/figure/' + figures[i]['name']);
            }
        }
    }

    // @param {word} string
    // 在 $('.dialog .word')中以打字机效果显示文字
    function typeWord(word) {
        onType = true;
        var position = 1;
        type(word);
        typeInterval = setInterval(function () {
            type(word);
        }, 100);
        function type(word) {
            if (position > word.length) {
                clearInterval(typeInterval);
                onType = false;
                if (auto) {
                    autoTimeout = setTimeout(nextScene, 2000);
                }
            } else {
                $('.dialog .word').text(word.substring(0, position++));
            }
        }
    }
})();