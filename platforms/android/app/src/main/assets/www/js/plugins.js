
$.fn.translate = function(target) {
   return this.each(function() {
     var $elm = $(this);

     if ($elm.data("translate") != "") {
         if (target === undefined) {

            $elm.html(translation[$elm.data("translate")]);
            if ($elm[0].hasAttribute("subtext")) {
                $elm.attr("title",translation[$elm.attr("data-translate") + "_text"]);
            }
         } else {
            $elm.attr(target,translation[$elm.data("translate-" + target)]);
         }
      }
  });
}
