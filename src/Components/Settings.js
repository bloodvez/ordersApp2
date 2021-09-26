import React from 'react'
import { useState } from 'react'
import { observer } from 'mobx-react-lite'

const Settings = observer(() => {
    const style = getComputedStyle(document.querySelector('.mainBody')).display
    const [cardFontSize, setCardFontSize] = useState(1.3)
    const [mainBodyDisplay, setMainBodyDisplay] = useState(style === 'flex' ? true : false)

    const handleChecking = (e) => {
        if(e.target.checked !== true){
            setMainBodyDisplay(false)
            document.documentElement.style.setProperty('--mainBodyDisplay', 'block')
        } else {
            setMainBodyDisplay(true)
            document.documentElement.style.setProperty('--mainBodyDisplay', 'flex')
        }
    }

    return (
        <div>
            <div>
                <input
                    className="fontSizeSlider"
                    type="range"
                    name="fontSizeRange"
                    min="1"
                    max="3"
                    step="0.1"
                    value={cardFontSize}
                    onChange={(e) => {
                        setCardFontSize(e.target.value)
                        document.documentElement.style.setProperty('--card-font-size', cardFontSize + "vh")
                    }}></input>
                <label htmlFor="fontSizeRange">{`Cards font size: ${cardFontSize}`}</label>
            </div>

            <div>
                <input
                    type="checkbox"
                    name="mainBodyDisplay"
                    checked={mainBodyDisplay}
                    onChange={handleChecking}
                ></input>
                <label htmlFor="mainBodyDisplay">{`Separate`}</label>
            </div>
        </div>
    )
})

export default Settings
