import React from 'react'
import { useState } from 'react'
import { observer } from 'mobx-react-lite'

const Settings = observer(() => {
    const [cardFontSize, setCardFontSize] = useState(1.3)

    return (
        <div>
            <input type="range" name="fontSizeRange" min="1" max="3" step="0.1" value={cardFontSize} onChange={(e) => {
                setCardFontSize(e.target.value)
                document.documentElement.style.setProperty('--card-font-size', cardFontSize + "vh")
            }}></input>
            <label htmlFor="fontSizeRange">{`Cards font size: ${cardFontSize}`}</label>
        </div>
    )
})

export default Settings
