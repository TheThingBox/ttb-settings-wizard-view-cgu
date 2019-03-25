var VIEW_CGU = function() {
  var Cgu = function(options) {
    this.type = Cgu.type
    this.tab_name = this.type
    this.tab_id = `tab_${this.type}`
    this.navtab_id = `navtab_${this.type}`
    this.main_container_id = `wizard_${this.type}`
    this.index = modules.findIndex(m => m.type === this.type)
    this.params = Object.assign({}, params.views[this.index])
    this.lang = {}
    this.view = ''
    this.form = {}
  }

  Cgu.prototype = new VIEW;

  Cgu.prototype.load = function(){
    return new Promise( (resolve, reject) => {
      this.getLang()
      .then( (lang) => {
        this.lang = i18n.create({ values: lang })
        return this.getView()
      })
      .then( (view) => {
        var _html = ejs.render(view, {
          wizard_cgu_html_url: `/settings_wizard/cgu/${params.device}_cgu_${params.lang_key}.html`,
          name: this.type,
          lang: this.lang
        })
        if(!_html){
          throw new Error(`cannot render ${this.params.ejs}`)
        } else {
          this.tab_name = this.lang('name')
          document.getElementById(this.navtab_id).innerHTML = this.tab_name
          document.getElementById(this.main_container_id).innerHTML = _html

          this.form = {}
          this.form.readed = false

          document.getElementById("wizard_cgu_form_accept").addEventListener('input', (e) => { this.cguReadedChange(e) });
          resolve()
        }
      })
      .catch(err => {
        reject(err)
      })
    })
  }

  Cgu.prototype.isOk = function(){
    if(this.form.readed){
      return true
    }
    return false
  }

  Cgu.prototype.checkButtonNextStats = function(){
    if(this.isOk()){
      document.getElementById("wizard_cgu_form_next").classList.remove("disabled")
    } else {
      document.getElementById("wizard_cgu_form_next").classList.add("disabled")
    }
    this.disableNextViews()
  }

  Cgu.prototype.cguReadedChange = function(e){
    this.form.readed = document.getElementById('wizard_cgu_form_accept').checked
    this.checkButtonNextStats()
  }

  Cgu.prototype.post = function(){
    var request = new Request(this.params.api)

    if(!this.isOk()){
      request.setData({})
    } else {
      request.setData({
        readed: this.form.readed
      })
    }
    return request.post()
  }

  Cgu.prototype.getResumed = function(){
    var _html = ''
    if(this.form.readed){
      _html = this.lang('resumed_accept')
    } else {
      _html = this.lang('renamed_not_accept')
    }
    return _html
  }

  Cgu.prototype.loaded = function(){
    var _flagsRequest = new Request(this.params.api)
    return new Promise( (resolve, reject) => {
      _flagsRequest.get().then( flags => {
        if(flags.readed === true){
          document.getElementById("wizard_cgu_form_accept").disabled = true
          document.getElementById('wizard_cgu_form_accept').checked = true
          this.form.readed = true
        }
        resolve()
      })
    })
  }

  Cgu.type = 'cgu'

  return Cgu
}()

modules.push({type: VIEW_CGU.type, module: VIEW_CGU})
