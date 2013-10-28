Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',

        launch: function() {
            var c = Ext.create('Ext.Container', {
                items: [
                    {
                    xtype: 'rallyprojectpicker',
                    fieldLabel: 'select project',
                        listeners:{
                            change: function(combobox){
                                if (!this.down('#u')) {
                                    this._onProjectSelected(combobox.getSelectedRecord());
                                }
                                else{
                                    if ( this.down('#g')) {
                                        console.log('grid exists');
                                        Ext.getCmp('g').destroy();
                                         console.log('grid deleted');
                                    }
                                    Ext.getCmp('u').destroy();
                                    console.log('user picker deleted');
                                    this._onProjectSelected(combobox.getSelectedRecord());
                                }
                            },
                            scope: this
                        }
                    },
                    //this is a combobox that will load all users from the sub. The selection in it is unrelated to the project picker selection
                    //commented out
                    /*
                    {
                        xtype: 'rallycombobox',
                        fieldLabel: 'select project',
                        storeConfig: {
                            autoLoad: true,
                            model: 'User',
                            filters:[
                                {
                                    property: 'ObjectID',
                                    operator: '>',
                                    value: 0
                                }
                            ],
                            sorters: [
                                {
                                    property: 'UserName',
                                    direction: 'ASC'
                                }
                            ]
                        }
                    }*/
                ],
            });
            this.add(c);
        },
        
        _onProjectSelected:function(record){
            var project = record.data['_ref'];
            console.log('project', project);
            
            
            var u = Ext.create('Rally.ui.combobox.UserComboBox',{
                id: 'u',
                project: project,
                fieldLabel: 'select user',
                listeners:{
                           ready: function(combobox){
                                this._onUserSelected(combobox.getRecord());
                           },
                           select: function(combobox){
                                this._onUserSelected(combobox.getRecord());
                           },
                           scope: this
                   }
            });
            this.add(u);
        },
        
        _onUserSelected:function(record){
            var user = record.data['_ref'];
            console.log('user', user);
           if(user){ 
            var filter = Ext.create('Rally.data.QueryFilter', {
                                 property: 'Owner',
                                 operator: '=',
                                 value: user
                             });
                             
                             filter = filter.and({
                                 property: 'ScheduleState',
                                 operator: '<',
                                 value: 'Accepted'  
                             });
                             filter.toString();
             
              var _store = Ext.create('Rally.data.WsapiDataStore', {
                 model: 'UserStory',
                 fetch: ['FormattedID','Name', 'Owner', 'ScheduleState'],
                 autoLoad: true,
                 filters : [filter],
                 //filters: [this.getContext().getTimeboxScope().getQueryFilter()],
                 listeners: {
                     //load: this._onDataLoaded,
                     load: function(store,records, success){
                        this._updateGrid(_store);
                     },
                        scope: this
                 }
             });
           }
            
        },
        
        _updateGrid: function(_store){
        if (!this.down('#g')) {
   		this._createGrid(_store);
   	}
   	else{
   		this.down('#g').reconfigure(_store);
   	}
   },
        _createGrid: function(_store){
   	console.log("load grid", _store);
   	var g = Ext.create('Rally.ui.grid.Grid', {
            id: 'g',
   		store: _store,
                columnCfgs: [
                                    'FormattedID',
                                    'Name',
                                    'Schedule State',
                                    'Owner'
                                ],
   		height: 400
   	});
   	this.add(g);
   },
});