<%= banner %>
(function(D, store) {
    "use strict";

var Posterior = window.Posterior = function(config, name) {
    return Posterior.api(config, name);
};
<%= content %>
Posterior.version = "<%= version %>";

})(document, window.store || function(){});
