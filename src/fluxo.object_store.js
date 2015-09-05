Fluxo.ObjectStore = Fluxo.Base.create({
  toJSON: function() {
    var data = JSON.parse(JSON.stringify(this.data));
    data.cid = this.cid;

    return data;
  }
});
