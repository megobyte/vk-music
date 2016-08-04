(function (){

    var tm = window.setInterval(function() {

        if (typeof audio !== "undefined") {
            var name = audio.performer + ' - ' + audio.title;
            var href = audio.url.replace(/\?.+/, "");

            if ($(".audio_page_player_title a.downloadLink").length < 1) {

                var link = document.createElement('a');
                link.className = 'downloadLink';	// добавим css класс 'downloadLink' для нашей ссылки
                link.textContent = "[Download]";
                link.setAttribute('download', name + '.mp3');	// имя файла для загрузки
                link.setAttribute('href', href);
                link.setAttribute('data-link', href);
                link.addEventListener('click', toBlob);

                $(".audio_page_player_title").append(link);
            }

            $(".audio_page_player .downloadLink").attr("download", name);
            $(".audio_page_player .downloadLink").attr("href", href);
        }

        var keys = [];

        $("div.audio_row").each(function() {
            if ($(this).find(".downloadLink").length < 1) {
                if (keys.length < 10) keys.push($(this).data("full-id"));
            }
        });

        if (keys.length > 0) {
            ajax.post("al_audio.php", {
              act : "reload_audio",
              ids : keys.join(",")
            }, {
              /**
               * @param {?} initial
               * @param {?} deepDataAndEvents
               * @return {undefined}
               */
              onDone : function(initial, deepDataAndEvents) {
                  $.each(initial, function(k, v) {
                      var str = JSON.stringify(v);
                      var div = $("div.audio_row[data-full-id='"+v[1]+"_"+v[0]+"']");
                      div.data("audio", str);

                      var name = v[4] + ' - ' + v[3];
                      var href = v[2].replace(/\?.+/, "");

                      var link = document.createElement('a');
                      link.className = 'downloadLink';	// добавим css класс 'downloadLink' для нашей ссылки
                      link.textContent = "[Download]";
                      link.setAttribute('download', name + '.mp3');	// имя файла для загрузки
                      link.setAttribute('href', href);
                      link.setAttribute('data-link', href);
                      link.addEventListener('click', toBlob);

                      div.find(".audio_title_wrap").append(link);
                  });
              }
          });
        }

    }, 1000);

    function toBlob(e) {
        e.stopPropagation();
    }
})();
