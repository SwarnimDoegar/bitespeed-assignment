import { DataTypes, Model, Optional } from 'sequelize'
import sequelizeConnection from '../../../db/config'

interface ContactAttributes {
    id: number;
    phoneNumber?: string;
    email?: string;
    linkedId?: number;
    linkPrecedence: LinkPrecedence;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}

export enum LinkPrecedence {
    Primary = "primary",
    Secondary = "secondary"
}

export interface ContactInput extends Optional<ContactAttributes, 'id'> { }
export interface ContactOuput extends Required<ContactAttributes> { }

class Contact extends Model<ContactAttributes, ContactInput> implements ContactAttributes {
    public id!: number
    public phoneNumber!: string
    public email!: string
    public linkedId!: number
    public linkPrecedence!: LinkPrecedence
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    public readonly deletedAt!: Date;
}

Contact.init({
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    phoneNumber: {
        type: DataTypes.STRING
    },
    email: {
        type: DataTypes.STRING
    },
    linkedId: {
        type: DataTypes.INTEGER.UNSIGNED
    },
    linkPrecedence: {
        type: DataTypes.STRING
    },
    createdAt: {
        type: DataTypes.DATE
    },
    updatedAt: {
        type: DataTypes.DATE
    }

}, {
    timestamps: true,
    sequelize: sequelizeConnection
})

export default Contact;