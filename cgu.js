_wizard_view_cgu_index = params.views.findIndex(v => v.name === 'cgu')

ejs.renderFile(
  params.views[_wizard_view_cgu_index].ejs,
  Object.assign({
    viewIndex: _wizard_view_cgu_index,
    wizard_cgu_html_url: `/settings_wizard/cgu/${params.device}_cgu_${params.lang}.html`
  }, params),
  { async: false },
  (_err, _str) => {
    document.getElementById('wizard_cgu').innerHTML = _str

    form_params.cgu = {}
    form_params.cgu.readed = false

    params.views[_wizard_view_cgu_index].isOk = function(){
      if(form_params.cgu.readed){
        return true
      }
      return false
    }

    params.views[_wizard_view_cgu_index].checkButtonNextStats = function(){
      if(params.views[_wizard_view_cgu_index].isOk()){
        document.getElementById("wizard_cgu_form_next").classList.remove("disabled")
      } else {
        document.getElementById("wizard_cgu_form_next").classList.add("disabled")
        disableNextViews()
      }
    }

    params.views[_wizard_view_cgu_index].getResumed = function(){
      var _html = ''
      if(form_params.cgu.readed){
        _html =  `You accepts the Terms stated on the CGU section.`
      } else {
        _html =  `You did not accepts the Terms stated on the CGU section.`
      }
      return _html
    }

    params.views[_wizard_view_cgu_index].post = function(){
      var request = new Request(params.views[_wizard_view_cgu_index].api)

      var ok = params.views[_wizard_view_cgu_index].isOk()
      if(!ok){
        request.setData({})
      } else {
        request.setData({
          readed: form_params.cgu.readed
        })
      }
      return request.post()
    }

    document.getElementById("wizard_cgu_form_accept").addEventListener('input', cguReadedChange);
    function cguReadedChange(e){
      form_params.cgu.readed = document.getElementById('wizard_cgu_form_accept').checked
      params.views[_wizard_view_cgu_index].checkButtonNextStats()
    }

    params.views[_wizard_view_cgu_index].loaded = function(){
      var _flagsRequest = new Request(params.views[_wizard_view_cgu_index].api)
      return new Promise( (resolve, reject) => {
        _flagsRequest.get().then( flags => {
          if(flags.readed === true){
            document.getElementById("wizard_cgu_form_accept").disabled = true
            document.getElementById('wizard_cgu_form_accept').checked = true
            form_params.cgu.readed = true
          }
          resolve()
        })
      })
    }
  }
);
