import { ethers } from 'ethers'
import store from '../store'
import Identicon from 'identicon.js'
import {mediaContractAddress, ABI} from './mediaContract'
import {approveERC20, Decimal} from '@zoralabs/zdk'
import { MaxUint256 } from '@ethersproject/constants'

var identiconOptions = {
    size: 36,                                // 420px square
    format: 'svg'                             // use SVG instead of PNG
}

export default class Authenticator {
    constructor() {
        // Authenticator variables
        this.currentAccount = null
        this.provider = null
        this.signer = null
        this.identicon = null
        this.mediaContract = null
        this.currency = '0xD92E713d051C37EbB2561803a3b5FBAbc4962431'    //TestUSDT
        // Initialize Authenticator
        if(typeof window.ethereum === 'undefined') {
            console.log('MetaMask is not installed')
            this.connectDefaultProvider()
            store.dispatch('registerZora', {signer: this.provider, chainId: 4})
            return
        }
        window.ethereum.on('accountsChanged', (accounts) => this.handleAccountsChanged(accounts))
        window.ethereum.request({ method: 'eth_accounts' })
            .then((accounts) => this.handleAccountsChanged(accounts))
            .catch((err) => { console.error(err) })
        window.ethereum.on('chainChanged', (_chainId) => this.handleChainChanged(_chainId))
    }
    async getChainId() {
        return parseInt(await window.ethereum.request({ method: 'eth_chainId' }), 16)
    }
    handleAccountsChanged(accounts) {
        console.log('account change triggered')
        if (accounts.length === 0) {
            this.currentAccount = null
            // MetaMask is locked or the user has not connected any accounts
            console.log('Please connect to MetaMask.')
            this.connectDefaultProvider()
            this.getChainId().then(chainId => {
                store.dispatch('registerZora', {signer: this.provider, chainId: chainId})
            })
        } else if (accounts[0] !== this.currentAccount) {
            this.currentAccount = accounts[0]
            this.identicon = new Identicon(this.currentAccount, identiconOptions).toString()
            this.provider = new ethers.providers.Web3Provider(window.ethereum)
            this.signer = this.provider.getSigner()
            this.mediaContract = new ethers.Contract(mediaContractAddress, ABI, this.provider)
            this.getChainId().then(chainId => {
                store.dispatch('registerZora', {signer: this.signer, chainId: chainId})
            })
        }
    }
    connectDefaultProvider() {
        this.provider = new ethers.providers.JsonRpcProvider('https://rinkeby.infura.io/v3/'+process.env.VUE_APP_INFURA_API)
        this.mediaContract = new ethers.Contract(mediaContractAddress, ABI, this.provider)
    }
    connectProvider() {
        if(typeof window.ethereum === 'undefined') {
            alert('Please install MetaMask')
            return
        }
        window.ethereum.request({ method: 'eth_requestAccounts' })
            .then((accounts) => this.handleAccountsChanged(accounts))
            .catch((err) => {
                if (err.code === 4001) {
                    console.log('Please connect to MetaMask.')
                } else {
                    console.error(err)
                }
            })
    }
    handleChainChanged(_chainId) {
        window.location.reload()
    }
    async grantERC20Approval() {
        return await approveERC20(this.signer, this.currency, store.state.zora.instance.marketAddress, ethers.utils.parseUnits('1', 6))
    }
}