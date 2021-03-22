<template>
	<div v-if="nft.id" role="listitem" class="nft w-dyn-item w-col w-col-3">
		<div class="nft-block">
			<router-link :to="{name: 'nft', params: { id: nft.id }}" class="nft-image-block w-inline-block">
				<div class="nft-bg-image" :style="'background-image: url('+nft.tokenURI+')'"></div><img src="../assets/placeholder.svg" class="image-2">
			</router-link>
			<div class="nft-info-block">
				<router-link :to="{name: 'nft', params: { id: nft.id }}" class="nft-title">{{title}}</router-link>
				<div class="nft-text-block">{{description}}</div>
				<div class="nft-details-block">
					<div class="nft-text-small">by: </div>
					<div class="nft-details-address">
						<div class="identicon v2" :style="'background-image: url(data:image/svg+xml;base64,'+identiconCreator+')'"></div>
						<div class="nft-text-small v2">{{ nft.creator.substring(0,5)}}...{{nft.creator.substr(nft.creator.length - 3)}}</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import Identicon from 'identicon.js'

var identiconOptions = {
    size: 36,
    format: 'svg'
}

export default {
	props: {
		nft: Object
	},
	data () {
		return {
			title: null,
			description: null,
			identiconCreator: null
		}
	},
	mounted() {
		if(typeof this.nft.id === 'undefined') return // return if Object is undefined
		let url = this.nft.metadataURI
		fetch(url)
			.then(res => res.json())
			.then((out) => {
				this.title = out.name
				if(out.description.length > 35) {
					this.description = out.description.substring(0, 35)+'...'
				} else {
					this.description = out.description
				}
				this.identiconCreator = new Identicon(this.nft.creator, identiconOptions).toString()
			})
			.catch(err => { throw err })
	}
}
</script>