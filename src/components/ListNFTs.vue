<template>
	<!--<div id="infinite-list" class='scrolling-component' ref='scrollComponent'>  
	</div>-->
    <div class="w-dyn-list">
        <div role="list" class="w-dyn-items w-row scrolling-component" id="infinite-list" ref='scrollComponent'>
            <NFTComponent v-for="nft in nfts" :nft="nft" :key="nft.id"/>
        </div>
    </div>
</template>

<script>
import loadNFTs from '../util/nftLoader'
import NFTComponent from './NFTComponent.vue'
import {ensureContractIsSet} from '../util/mediaContract'

export default {
    components: { NFTComponent },
    props: {
		request: String
	},
    data: function (){
        return {
            nfts: [Object()],
            last: null,
            listEl: null,
            handleEvent: null,
            endOfList: false
        }
    },
    methods: {
        loadMoreNFTs(last) {
            const batchSize = 36
            if(this.endOfList) {
                console.log('end of list')
                return
            }
            console.log('loading more...')
            loadNFTs(last, this.request).then((docs) => {
                if(docs.docs.length < batchSize) this.endOfList = true
                this.nfts.push(...docs.docs)
                this.last = docs.lastItem
                if(!window.scrollEventListenerAdded) {
                    window.addEventListener('scroll', this.handleEvent)
                    window.scrollEventListenerAdded = true
                }
            })
        },
    },
    mounted() {
        this.handleEvent = (e) => {
            if(window.innerHeight + window.scrollY >= document.body.offsetHeight - 0.5) {
                window.removeEventListener('scroll', this.handleEvent)
                window.scrollEventListenerAdded = false
                this.loadMoreNFTs(this.last.id)
            }
        }
        if(!window.scrollEventListenerAdded) {
            window.addEventListener('scroll', this.handleEvent)
            window.scrollEventListenerAdded = true
        }
        if(this.request == 'all') {
            this.loadMoreNFTs(0)
        } else {
            ensureContractIsSet().then(() => {
            this.loadMoreNFTs(0)
        })
        }
    }
}
</script>