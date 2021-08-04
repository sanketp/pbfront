import React, { useState, useEffect } from 'react'
import dbService from './services/dbactions'


const Numbers = (props) => {
    const entries = props.vals

    if (props.filt === "") {
        return (
            <div>
                <h1>Numbers</h1>
                {entries.map(entry =>
                    <Num key={entry.id} id={entry.id} name={entry.name} number={entry.number} pers={entries} setPer={props.setPer} />
                )}
            </div>
        )
    }
    else {
        const regexp = new RegExp(props.filt, 'i')
        const matches = entries.filter(x => regexp.test(x.name))
        if (matches.length === 0) {
            return (
                <div>
                    <h1>Numbers</h1>
                    Person Not Found!
                </div>
            )
        }
        return (
            <div>
                <h1>Numbers</h1>
                {matches.map(ele => <Num key={ele.id} id={ele.id} name={ele.name} number={ele.number}
                    pers={entries} setPer={props.setPer} />)}
            </div>
        )
    }
}

const Num = (props) => {
    const handleDelete = (myID) => {
        if (window.confirm("you sure you want to delete?")) {
            dbService
                .deleteperson(myID)
                .then(response => {
                    props.setPer(props.pers.filter(ele => ele.id !== myID))
                })
        }
    }
    return (
        <div>
            {props.name} {props.number} <button type="button" onClick={() => handleDelete(props.id)} > delete</button>
        </div>
    )
}

const Filter = (props) => {
    return (
        <div>
            search: <input value={props.value} onChange={props.handler} />
        </div>
        )
}

const PersonForm = (props) => {
    return (
        <form>
            <div>
                name: <input value={props.name} onChange={props.nameChange} />
            </div>
            <div>
                number: <input value={props.num} onChange={props.numChange} />
            </div>
            <div>
                <button type="button" onClick={props.clChange}>add</button>
            </div>
        </form>
    )
}

const ErrorNotification = ({ message }) => {
    if (message == null) {
        return null
    }

    return (
        <div className="notiDisplay">{message}</div>
    )

}


const App = () => {
    const [persons, setPersons] = useState([])
    const [newName, setNewName] = useState('')
    const [newNum, setNewNum] = useState('')
    const [newSearch, setNewSearch] = useState('')
    const [noti, setNoti] = useState(null)

    useEffect(() => {
        dbService
            .getAll()
            .then(initialBook => {
                setPersons(initialBook)
            })
    }, [])
    

    const handleNameChange = (event) => {
        setNewName(event.target.value)
    }

    const handleNumChange = (event) => {
        setNewNum(event.target.value)
    }

    const handleSearchChange = (event) => {
        setNewSearch(event.target.value)
    }

    const handleClick = (event) => {
        if (newName !== "") {
            if (persons.find(x => x.name === newName) === undefined) {
                setNoti(newName + ' was added to the phonebook');
                const personObj = {
                    name: newName,
                    number: newNum
                }
                dbService
                    .create(personObj)
                    .then(returnedPerson => {
                        setPersons(persons.concat(returnedPerson))
                        setNewName('')
                        setNewNum('')
                    })
                setTimeout(() => { setNoti(null) }, 5000)
   
            }
            else {
                if (window.confirm(newName + " already exists, do you want to replace it")) {
                    setNoti(newName + ' number was updated');
                    const tempID = persons.find(x => x.name === newName).id;
                    const personObj = {
                        id: tempID,
                        name: newName,
                        number: newNum
                    }
                    dbService
                        .update(tempID, personObj)
                        .then(updatedBook => {
                            setPersons(updatedBook)
                        })
                    setNewName('')
                    setNewNum('')
                    setTimeout(() => { setNoti(null) }, 5000)
                }
            }
        
        }
    }



    return (
        
        <div>
            <h2>Phonebook</h2>
            <ErrorNotification message={noti} />
            <Filter search={newSearch} handler={handleSearchChange} />
            <PersonForm name={newName} nameChange={handleNameChange} num={newNum} numChange={handleNumChange} clChange={handleClick} />
            <Numbers vals={persons} filt={newSearch} setPer={setPersons} />
        </div>
    )
}

export default App;