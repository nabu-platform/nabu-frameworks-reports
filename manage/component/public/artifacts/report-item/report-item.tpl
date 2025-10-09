<template id="report-item">
	<div class="is-report-item" :class="['is-report-item-' + resultType, 'is-report-item-' + visualisationType]">
		<template v-if="resultType == 'list'">
			<table class="is-table is-report-table">
				<thead>
					<tr class="is-report-title" v-if="title"><th :colspan="columns.length">{{title}}</th></tr>
					<tr>
						<th v-for="column in columns">{{column}}</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="row in raw">
						<td v-for="column in columns">{{row[column]}}</td>
					</tr>
				</tbody>
			</table>
		</template>
		<template v-else-if="resultType == 'fact'">
			<h3 v-if="title" class="is-report-title">{{title}}</h3>
			<p class="is-report-fact">{{item.aggregate}}<span v-if="item.aggregateDelta" class="is-badge" :class="{'is-success': item.aggregateDelta > 0, 'is-error': item.aggregateDelta < 0}">{{$services.formatter.number(item.aggregateDelta, 1)}}</span></p>
		</template>
		<template v-else-if="resultType == 'normalized'">
			<h3 v-if="title" class="is-report-title">{{title}}</h3>
			<svg ref="svg"></svg>
		</template>
		<template v-else>
			<p class="is-report-error">Invalid visualisation type</p>
		</template>
	</div>
</template>