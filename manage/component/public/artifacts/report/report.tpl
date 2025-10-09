<template id="report-detail">
	<div class="is-report is-row is-wrap-wrap">
		<template v-if="report.sources">
			<report-item v-for="source in report.sources" class="is-column" :class="['is-width-column-' + (source.width ? source.width : 12)]"
				:title="source.title"
				:style="{'aspect-ratio': source.ratio ? source.ratio : null}"
				:item="source.result"/>
		</template>
	</div>
</template>