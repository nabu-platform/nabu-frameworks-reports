Vue.view("report-detail", {
	template: "#report-detail",
	props: {
		reportId: {
			type: String,
			required: false
		},
		report: {
			type: Object,
			required: false
		},
		serviceContext: {
			type: String,
			required: false
		}
	},
	data: function() {
		return {
			report: null
		}
	},
	created: function() {
		if (!this.report && this.reportId) {
			this.load();
		}
	},
	methods: {
		load: function() {
			var self = this;
			this.$services.swagger.execute("nabu.frameworks.reports.manage.rest.report.get", {reportId: this.reportId, "$serviceContext": this.serviceContext}).then(function(result) {
				self.report = result;
			});
		}
	}
})