import React,{useState, useEffect} from "react";
import Web3Modal from "web3modal";
import { ethers } from "ethers";

//INTERNAL IMPORT
import tracking from "../Context/Tracking.json";
const ContractAddress =  "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
const ContractABI = tracking.abi;

//---FETCHING SMART CONTRACT-------------
const fetchContract = (signerOrProvider)=>
new ethers.Contract(ContractAddress,ContractABI,signerOrProvider);

export const TrackingContext = React.createContext();

export const TrackingProvider = ({children})=>{
    const DappName = "Product Tracking Dapp";
    const [currentUser, setCurrentUser] = useState("");

    const createShipment = async(items)=>{
        console.log(items);
        const {receiver,pickupTime,distance,price}=items;
        try{
            const web3modal = new Web3Modal();
            const connection = await web3modal.connect();
            const provider = new ethers.providers.Web3Provider(connection);
            const signer = provider.getSigner();
            const contract = fetchContract(signer);
            const createItem = await contract.createShipment(
                receiver,
                new Date(pickupTime).getTime(),
                distance,
                ethers.utils.parseUnits(price,18),
                {
                    value:ethers.utils.parseUnits(price,18),
                }
                
            );
            await createItem.wait();
                console.log(createItem);
        }catch(error){
            console.log("Something went wrong",error);
        }
    }

    const getAllShipment = async ()=>{
        try{
            const provider = new ethers.provider.JsonRpcProvider();
            const contract = fetchContract(provider);

            const shipments = await contract.getAllTransactions();
            const allShipments = shipments.map((shipments)=>({
                sender: shipment.sender,
                receiver: shipment.receiver,
                price:ethers.utils.formatEther(shipment.price.toString()),
                pickupTime:shipment.pickupTime.toNumber(),
                deliveryTime:shipment.deliveryTime.toNumber(),
                distance:shipment.distance.toNumber(),
                isPaid:shipment.isPaid,
                status:shipment.status,
            }));
            return allShipments;
        }catch(error){
            console.log("error want, getting shipment");
        }
    }
    const getShipmentCount = async()=>{
        try{
            if(!window.ethereum)return "Install Metamask";

            const accounts = await window.ethereum.request({
                method:"eth_accounts",
            });
            const provider = new ethers.provider.JsonRpcProvider();
            const contract = fetchContract(provider);
            const shipmentsCount = await contract.getShipmentCount(accounts[0]);
            return shipmentsCount.toNumber();
        }
        catch(error){
            console.log("error want, getting shipments");
        }
    };

    const completeShipment = async(completeShip) =>{
        console.log(completeShip);
        const {receiver,index}= completeShip;
        try{
            if(!window.ethereum) return "Install Metamask";
            const accounts = await window.ethereum.request({
                method:"eth_accounts",
            });
            const web3modal = new Web3Modal();
            const connection = await web3modal.connect();
            const provider = new ethers.provider.Web3Provider(connection);
            const signer = fetchContract(signer);

            const transaction = await contract.completeShipment(
                accounts[0],
                receiver,
                index,{
                    gasLimit:300000,
                }
            );
            transaction.wait();
            console.log(transaction);

        }catch(error){
            console.log("wrong completeShipment ", error);
        }
    }

    const getShipment = async(index)=>{
        console.log(index*1);
        try{
            if(!window.ethereum) return "Install MetaMask";

            const accounts = await window.ethereum.request({
                method:"eth_accounts"
            })

            const provider = new ethers.providers.JsonRpcProvider();
            const contract = fetchContract(provider);
            const shipment = await contract.getShipment(accounts[0],index*1);

            const SingleShipment = {
                sender: shipment[0],
                receiver:shipment[1],
                pickupTime:shipment[2].toNumber(),
                deliveryTime:shipment[3].toNumber(),
                distance:shipment[4].toNumber(),
                price:ethers.utils.formatEther(shipment[5].toString()),
                status:shipment[6],
                isPaid:shipment[7],
            }
            return SingleShipment;
    } catch(error){
        console.log("sorry no chipemet");
    }
}
const startShipment = async(getProduct)=>{
    const{receiver,index}= getProduct;
    try{
        if(!window.ethereum) return "Install MetaMask";

        const accounts = await window.ethereum.request({
            method:"eth_accoutns",
        })
        const web3modal = new web3modal();
        const connection = await web3modal.connect();
        const Provider = new ethers.provider.Web3ModalProvider(connection);
        const signer = provider.getSigner();
        const contract = fetchContract(signer);
        const shipment = await contract.startShipment(
            accounts[0],
            receiver,
            index*1
        );
        shipment.wait();
        console.log(shipment);

    }catch(error){
        console.log("sorry no chipment", error);
    }
};

//CHECK WALLET CONNECTION 

const checkIfWalletconnected = async()=>{
    try{
        if(!window.ethereum) return "Install MetaMask";

        const accounts = await window.ethereum.request({
            method:"eth_accounts",
        })
        if(accounts.length){
            setCurrentUser(accounts[0]);
        }else{
            return "No account";
        }
    }catch(error)
    {
        return "not connected";
    }
}

// CONNECT WALLET FUNCTION 
    const connectWallet = async()=>{
        try{
            if(!window.ethereum) return "Install MetaMask";
            const accounts = await window.ethereum.request({
                method:"eth_requestAccounts",
            })
            setCurrentUser(accounts[0]);
        }catch(error){
            return "something went wrong";
        }
    }
    useEffect(()=>{
        checkIfWalletconnected();
    },[]);

    return (
        <TrackingContext.Provider
        value={{
            connectWallet,
            createShipment,
            getAllShipment,
            completeShipment,
            getShipment,
            startShipment,
            getShipmentCount,
            DappName,
            currentUser,
        }}>
        {children}
        </TrackingContext.Provider>
    )
}
