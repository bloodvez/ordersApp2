import React from 'react'
import { useState } from 'react'

const AppearenceSettings = () => {
    const documentRoot = document.querySelector(':root')
    const style = getComputedStyle(document.querySelector('.mainBody')).display
    const [cardFontSize, setCardFontSize] = useState(1.3)
    const [mainBodyDisplay, setMainBodyDisplay] = useState(style === 'flex' ? true : false)

    const handleChecking = (e) => {
        if (e.target.checked !== true) {
            setMainBodyDisplay(false)
            documentRoot.style.setProperty('--mainBodyDisplay', 'block')
        } else {
            setMainBodyDisplay(true)
            documentRoot.style.setProperty('--mainBodyDisplay', 'flex')
        }
    }

    return (
        <div className="appearenceSettings">
            <h1 className="settingsH1">Appearence</h1>
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
                        documentRoot.style.setProperty('--card-font-size', cardFontSize + "vh")
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
}

export default AppearenceSettings
