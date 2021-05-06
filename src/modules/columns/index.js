import React from "react";
import BaseComponent from '../baseComponent'
import CoulumnComponent from './coulumnsComponents'
import AddInfoComponent from '../add-info/addInfoComponent'
import Header from '../common/index'
import { states, getTags, getFilteredData } from "../../services/columns"
import utility from "../../utility";
import { stateNamesConstant } from "../../constants";
import { history } from "../../managers/history";
import SelectCategory from "../mobile-view/select-category"

class Coloumn extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {
            name: "",
            nameError: "",
            isAbout: false,
            selectedState: "All States",
            selectedCategory: "All Categories",
            selectedTime: "4",
            drawerOpen: false,
            responseData: [],
            originalResponseData: [],
            countryStateList: [],
            responseByIndex: {},
            responseByLocation: {},
            param: [],
            list: [

                {
                    label: "Oxygen",
                    filterKey: "oxygen"
                },
                {
                    label: "Bed",
                    filterKey: "bed"
                },
                {
                    label: "Blood Plasma",
                    filterKey: "plasma"
                },
                {
                    label: "Remdesivir/Tocilizumab",
                    filterKey: "remdesivir",
                    filterKey2: "tocilizumab"
                },
                {
                    label: "Fabiflu",
                    filterKey: "fabiflu"
                },
            ]

        }
    }

    componentDidMount() {
        const route = window.location.pathname;
        let params = route.split('/')
        params = params.filter(data => data.length > 0)
        this.setState({ param: params })
        this.getStates("")
        this.getAllStatesAndCategories()
    }

    incrementUpVote = (id) => {
        let index = this.state.responseByIndex[id].index;
        this.state.responseData[index].upVoteCount = this.state.responseData[index].upVoteCount + 1;
        this.setState({ responseData: this.state.responseData, originalResponseData: this.state.responseData })
    }

    incrementDownVote = (id) => {
        let index = this.state.responseByIndex[id].index;
        this.state.responseData[index].downVoteCount = this.state.responseData[index].downVoteCount + 1;
        this.setState({ responseData: this.state.responseData, originalResponseData: this.state.responseData })

    }

    getStates = async (stateValue) => {
        let data = `${stateValue}`
        this.setState({ responseData: [], originalResponseData: [] })

        try {
            let response = await states(data)
            if (response.responseData && Array.isArray(response.responseData) && response.responseData.length) {

                let responseByIndex = {};
                let responseByLocation = {};
                let countryStateList = [];
                let keyToSave = "";

                response.responseData.forEach((obj, index) => {
                    responseByIndex[obj._id] = { "index": index, ...obj }

                    if (obj.state)
                        keyToSave = obj.state;
                    else if (obj.district)
                        keyToSave = obj.district;

                    // Make it Sentense case
                    keyToSave = stateNamesConstant[keyToSave] ? stateNamesConstant[keyToSave] : utility.toSentenceCase(keyToSave);
                    if (!responseByLocation[keyToSave]) {
                        responseByLocation[keyToSave] = [];
                        countryStateList.push({ title: keyToSave })
                    }

                    responseByLocation[keyToSave].push({
                        "index": index,
                        ...obj
                    })
                })

                this.setState({
                    responseData: response.responseData,
                    originalResponseData: response.responseData,
                    responseByIndex: responseByIndex,
                    responseByLocation: responseByLocation,
                    //  countryStateList: countryStateList.sort((a, b) => b.title < a.title ? 1 : -1)
                })

            }
        } catch (error) {
            console.log(error)
        }

    }
    getAllStatesAndCategories = async () => {
        try {
            const response = await getTags()
            if (!response || !response.responseData || !Array.isArray(response.responseData)) {
                return;
            }
            const statesArray = await response.responseData.filter((obj) => {
                if (obj.type === "STATE") {
                    obj["title"] = stateNamesConstant[obj.name] ? stateNamesConstant[obj.name] : obj.name
                    return obj
                }
            });
            const categoryArray = await response.responseData.filter((obj) => {
                if (obj.type === "CATEGORY" && obj.name.toLowerCase() !== "ambulance") {
                    obj.name = obj.name.toUpperCase()
                    return obj;
                }
            });
            this.setState({
                countryStateList: statesArray,
                allLocations: statesArray,
                categoryList: categoryArray
            })
            console.log("countryStateList", this.state.categoryList);
        } catch (error) {
            console.log(error)
        }
    }


    handleChangeForCountryState = async (event, selectedCountryState) => {
        if (event && event.target && !event.target.value && document.getElementById("AllStates"))
            document.getElementById("AllStates").blur();

        const selectedStateObject = this.state.countryStateList.find(item => (item.title === selectedCountryState))
        const selectedStateName = selectedStateObject && selectedStateObject.name ? selectedStateObject.name : ''
        let selectedCategory = this.state.selectedCategory === "All Categories" ? '' : this.state.selectedCategory;
        console.log("se;ecgjhjkdnl", this.state.selectedCategory);
        const { responseData, error } = await getFilteredData({
            category: selectedCategory.includes('/') ? selectedCategory.split('/')[0].toUpperCase() : selectedCategory.toUpperCase(),
            state: selectedStateName ? selectedStateName : ''
        })
        let filteredData = selectedCountryState || selectedCategory ? responseData : this.state.originalResponseData
        if (!responseData)
            return
        this.setState({ responseData: filteredData, selectedState: selectedStateName ? selectedStateName : "All States" })
    }
    handleChangeForCategory = async (event, selectedCategory) => {
        console.log("Cattebsn", selectedCategory);
        if (event && event.target && !event.target.value && document.getElementById("AllCategories"))
            document.getElementById("AllCategories").blur();

        const selectedCategoryObject = this.state.categoryList.find(item => (item.name === selectedCategory))
        const selectedCategoryName = selectedCategoryObject && selectedCategoryObject.name ? selectedCategoryObject.name : '';
        let selectedState = this.state.selectedState === "All States" ? '' : this.state.selectedState;
        const { responseData, error } = await getFilteredData({
            category: selectedCategoryName ? selectedCategoryName.includes('/') ? selectedCategoryName.split('/')[0].toUpperCase() : selectedCategoryName.toUpperCase() : '',
            state: selectedState
        })

        let filteredData = selectedCategory || selectedState ? responseData : this.state.originalResponseData
        if (!responseData)
            return
        this.setState({ responseData: filteredData, selectedCategory: selectedCategoryName ? selectedCategoryName : "All Categories" })
    }

    handleColumnClose = async (item) => {
        var array = this.state.list;
        var index = array.indexOf(item)
        array.splice(index, 1);
        this.setState({ list: array });
    }

    render() {
        return (
            <div className="desktop-view">
                <Header
                    handleChangeForCountryState={this.handleChangeForCountryState} onRefresh={this.getStates}
                    countryStateList={this.state.countryStateList}
                    state={this.state}
                    handleChangeForCategory={this.handleChangeForCategory}
                />
                <CoulumnComponent state={this.state}
                    getStates={this.getStates}
                    handleChangeForCountryState={this.handleChangeForCountryState}
                    incrementUpVote={this.incrementUpVote}
                    incrementDownVote={this.incrementDownVote}
                    handleColumnClose={this.handleColumnClose}
                    drawerToggleClickHandler={this.drawerToggleClickHandler}
                    backdropClickHandler={this.backdropClickHandler}
                    handleNavigate={this.handleNavigate}
                    responseData={this.state.responseData}
                    handleChangeForCategory={this.handleChangeForCategory}
                />
            </div>
        );
    }
}

export default Coloumn;
