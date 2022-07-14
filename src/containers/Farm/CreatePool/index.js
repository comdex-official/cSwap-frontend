import { Button } from 'antd'
import React from 'react'
import { useState } from 'react'
import CreatePoolModal from './CreatePool'

const CreatePool = ({refreshData, refreshBalance}) => {
    const [openPoolModal, setOpenPoolModal] = useState();
    const openPool = () => {
        setOpenPoolModal(true);
    }
    const closePool = () => {
        setOpenPoolModal(false);
    }
    return (
        <>
            <Button className="ant-btn-primary btn-filled " onClick={() => openPool()}>Create Pool</Button>
            <CreatePoolModal openPoolModal={openPoolModal} closePool={closePool}
                             refreshData={refreshData} refreshBalance={refreshBalance}/>
        </>
    )
}

export default CreatePool