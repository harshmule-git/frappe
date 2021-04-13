frappe.ui.form.ControlCKEditor = frappe.ui.form.ControlCode.extend({
	make_wrapper() {
		this._super();
		this.$wrapper.find(".like-disabled-input").addClass('ck-editor');
	},

	make_input() {
		this.has_input = true;
		this.make_ckeditor();
	},

	make_ckeditor() {
		if (this.ckeditor) return;
		this.ckeditor_container = $('<div class="ckeditor">').appendTo(this.input_area);
		this.ckeditor_toolbar = $('<div class="ckeditor-toolbar">').appendTo(this.ckeditor_container);
		this.ckeditor_content = $('<div class="ckeditor-content">').appendTo(this.ckeditor_container);

		this.ckeditor = DecoupledEditor
			.create( this.ckeditor_content[0], this.get_ckeditor_options() )
			.then( editor => {
				console.log( 'Editor was initialized', editor );
				this.ckeditor_toolbar.append(editor.ui.view.toolbar.element);
				this.bind_events();
			} )
			.catch( error => { console.error(error) } );
	},

	bind_events() {
		let me = this;
		me.ckeditor.then(() => {
			me.ckeditor.model.document.on('change:data', frappe.utils.debounce((delta, oldDelta, source) => {
				if (!me.is_ckeditor_dirty(source)) return;

				const input_value = this.get_input_value();
				me.parse_validate_and_set_in_model(input_value);
			}, 300));
		})
	},

	is_ckeditor_dirty(source) {
		let me = this;
		if (source === 'api') return false;

		me.ckeditor.then(() => {
			let input_value = me.get_input_value();
			return me.value !== input_value;
		});
	},

	get_ckeditor_options() {
		// Set default toolbar options as per Decoupled Editor
		return {};
	},

	parse(value) {
		if (value == null) {
			value = "";
		}
		return frappe.dom.remove_script_and_style(value);
	},

	set_formatted_input(value) {
		let me = this;
		me.ckeditor.then(() => {
			if (value === me.get_input_value()) return;
			if (!value) {
				// clear contents for falsy values like '', undefined or null
				me.ckeditor.setData('');
				return;
			}
			me.ckeditor.setData(value);
		});
	},

	get_input_value() {
		let me = this;
		me.ckeditor.then(() => {
			let value = me.ckeditor.getData();
			value = value.replace(/(\s)(\s)/g, ' &nbsp;');

			return value;
		});
	},

	set_focus() {}
});

// https://stackoverflow.com/questions/14062654/ckeditor-getdata-doesnt-seem-to-work-as-it-should