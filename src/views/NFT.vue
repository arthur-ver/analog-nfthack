<template>
	<div class="hero_home v2">
		<div class="hero_content v2">
		<h2 id="blotter" class="largeheading nft-heading">{{ title }}</h2>
		<p class="paragraph cc-large cc-w90">{{ description }}</p>
		<div class="buy-block" v-if="authenticator.currentAccount != creator.toLowerCase() && currentAskPrice != 0">
			<a href="#" class="button v2 w-inline-block">
			<div class="button_textlink">BUY NFT</div>
			</a>
			<h3 id="blotter" class="topheading">1 ETH</h3>
		</div>
		<div class="transfer-block" v-if="authenticator.currentAccount == creator.toLowerCase()">
			<a href="#" class="button v2 w-inline-block">
			<div class="button_textlink">TRANSFER TO ADDRESS</div>
			</a>
		</div>
		<div class="setask-block" v-if="authenticator.currentAccount == creator.toLowerCase()">
			<a href="#" class="button v2 w-inline-block">
			<div class="button_textlink">SET ASK</div>
			</a>
		</div>
		</div>
		<div class="hero_content"><img :src="tokenURI" loading="lazy" class="image-3"></div>
	</div>
</template>

<script>
import {tokenCreators,tokenURI,tokenMetadataURI,ensureContractIsSet} from '../util/mediaContract'
import {mapState} from 'vuex'
import store from '../store'
import { ethers } from 'ethers'

export default {
    name: 'NFT',
    metaInfo: {
        title: 'ANALOG NFTs — NFT',
        viewport: 'width=device-width, initial-scale=1'
    },
	computed: mapState(['authenticator', 'zora']),
	data () {
		return {
			title: null,
			description: null,
			id: null,
			creator: '',
			tokenURI: null,
			metadataURI: null,
			timestamp: null,
			setAskPrice: null,
			currentAskPrice: '',
			transferToAddress: null
		}
	},
	created() {
		this.id = this.$route.params.id
	},
	mounted() {
        ensureContractIsSet().then(() => {
			console.log('contract is loaded')
			const promises = []
			promises.push(tokenCreators(this.id))
			promises.push(tokenURI(this.id))
			promises.push(tokenMetadataURI(this.id))
			Promise.all(promises).then((data) => {
				this.creator = data[0]
				this.tokenURI = data[1]
				this.metadataURI = data[2]
				store.state.zora.fetchCurrentAsk(this.id).then(res => { 
					if(res != 0) this.currentAskPrice=String(res/(Math.pow(10, 18)))
				})
				fetch(this.metadataURI)
				.then(res => res.json())
				.then((out) => {
					this.title = out.name
					this.description = out.description
				})
				.catch(err => { throw err })
			})
        })
    },
	methods: {
		async setAsk() {
			const askPrice = Number(this.setAskPrice)
			const ask = store.state.zora.constructAsk(askPrice)
			return await new Promise((resolve, reject) => {
				store.state.zora.isValidAsk(this.id, ask).then(res => resolve(res))
			})
			.then(res => {
				if(res) {
					return new Promise((resolve, reject) => {
						store.state.zora.setAsk(this.id, ask).then(res => resolve(res))
					})
				} else {
					reject(new Error('Ask price is not valid'))
				}
			})

		},
		async buy(bidderAddress) {
			/*store.state.authenticator.grantERC20Approval().then(res => {
				console.log(res)

			})*/
			const bidPrice = Number(this.currentAskPrice)
			console.log(bidPrice)
			const bid = store.state.zora.constructBid(bidPrice, ethers.utils.getAddress('0x643DEaA22252982Be1571DafEc28cc6d8d10d376'))
			return await new Promise((resolve, reject) => {
				store.state.authenticator.grantERC20Approval().then(tx => {
					console.log(tx)
					resolve(tx)
				})
			})
			.then((tx) => {
				return new Promise((resolve, reject) => {
					tx.wait(1).then((res) => resolve())
				})
			})
			.then(() => {
				return new Promise((resolve, reject) => {
					console.log("called setbid")
					store.state.zora.setBid(this.id, bid)
				})
			})
		},
		setAskBtn() {
			this.setAsk().then(tx => {
				tx.wait(1).then(() => window.location.reload())
			})
		},
		buyBtn() {
			this.buy().then(tx => {
				//tx.wait(1).then(() => window.location.reload())
			})
		},
		transferBtn() {
			store.state.zora.instance.transferFrom(store.state.authenticator.currentAccount, this.transferToAddress, this.id).then(res => console.log(res))
		}
	}
}
</script>