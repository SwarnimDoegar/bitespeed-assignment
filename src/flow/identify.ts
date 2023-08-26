import { ProcessorFunction } from "../types/app";
import { IdentifyRequest, IdentifyResponse, ContactDetails } from "../types/flow/identify";
import { Contact, LinkPrecedence } from "../types/db/models";
import { Op } from "sequelize";
import { send400Err, send500Err } from "./errors";

const identifyCustomer: ProcessorFunction<IdentifyRequest, IdentifyResponse> = async function (req: IdentifyRequest) {
    if (!req.email && !req.phoneNumber) {
        send400Err("Both email and phone number cannot be empty.")
    }
    const emailFilter = req.email ? [{ email: req.email }] : [];
    const phoneNumberFilter: any = req.phoneNumber ? [{ phoneNumber: req.phoneNumber }] : []
    const filters = emailFilter.concat(phoneNumberFilter)
    let primaryContactId : number;
    const matchedContacts = await Contact.findAll({
        where: {
            [Op.or]: filters
        }
    })
    if (!matchedContacts.length) {
        let newContact = await createFirstNewContact(req.email, req.phoneNumber);
        primaryContactId = newContact ? newContact.id : send500Err("Failed to create a new contact.");
    }
    else {
        let allContacts = await getAllRelatedContacts(matchedContacts);
        primaryContactId = await resolveConflictedPrimaryContacts(allContacts);
        let emailPresent = req.email ? matchedContacts.find(c => c.email === req.email) : true
        let phonePresent = req.phoneNumber ? matchedContacts.find(c => c.phoneNumber === req.phoneNumber) : true
        if (!emailPresent || !phonePresent ){
            await createNewSecondaryContact(req.email, req.phoneNumber, primaryContactId);
        }
    }

    let mPrimaryContact : Contact | null = await Contact.findOne({
        where: {id: primaryContactId}
    })
    let primaryContact : Contact = mPrimaryContact ?? send500Err("Unable to fetch primary account")
    console.log("Primary contact", primaryContact)

    let allSecondaryContacts = await Contact.findAll({
        where: {linkedId: primaryContactId}
    })
    console.log("Secondary contacts", allSecondaryContacts.map(c => c.dataValues))

    let allRelatedContacts = [primaryContact, ...allSecondaryContacts]
    allRelatedContacts = allRelatedContacts.sort((c1, c2) => c1.linkPrecedence > c2.linkPrecedence ? 1 : -1)
    console.log("All contacts", allRelatedContacts.map(c => c.dataValues))

    let emails = allRelatedContacts.map(c => c.email);
    let phoneNumbers = allRelatedContacts.map(c => c.phoneNumber);
    allRelatedContacts.shift();
    return {
        contact: {
            primaryContactId,
            emails,
            phoneNumbers,
            secondaryContactIds: allRelatedContacts.map(c => c.id)
        }
    }
}

async function createFirstNewContact(email?: string, phoneNumber?: string) {
    try {
        return await Contact.create({
            email,
            phoneNumber,
            linkPrecedence: LinkPrecedence.Primary,
            createdAt: new Date(),
            updatedAt: new Date()
        })
    } catch (error) {
        send500Err("Failed to create new contact.")
    }
}

async function createNewSecondaryContact(email?: string, phoneNumber?: string, linkedId? : number) {
    try {
        return await Contact.create({
            email,
            phoneNumber,
            linkPrecedence: LinkPrecedence.Secondary,
            linkedId,
            createdAt: new Date(),
            updatedAt: new Date()
        })
    } catch (error) {
        send500Err("Failed to create new contact.")
    }
}

async function getAllRelatedContacts (contacts : Array<Contact>) {
    let secondaryContacts = contacts.filter((c => c.linkPrecedence === LinkPrecedence.Secondary))
    let primaryContacts = contacts.filter((c => c.linkPrecedence === LinkPrecedence.Primary))
    let linkedIdsOfSecondaryContacts = secondaryContacts.map(c => c.linkedId)
    let idsOfPrimaryContacts = primaryContacts.map(c => c.id)
    let allPrimaryContacts = await Contact.findAll({
        where: {
            [Op.or] : [
                {id: [...linkedIdsOfSecondaryContacts, ...idsOfPrimaryContacts]},
                {linkedId: idsOfPrimaryContacts}
            ]
        }
    })
    return allPrimaryContacts;
}

async function resolveConflictedPrimaryContacts(contacts : Array<Contact>) : Promise<number>{
    let primaryContacts = contacts.filter(c => c.linkPrecedence === LinkPrecedence.Primary);
    if (!primaryContacts.length) send500Err("No primary contact found linked to these details.");
    if (primaryContacts.length > 1){
        let sortedPrimaryContacts = primaryContacts.sort((c1, c2) => c1.createdAt >= c2.createdAt ? 1 : -1)
        let primaryContact = sortedPrimaryContacts[0];
        let primaryContactId = primaryContact.id;
        let demotablePrimaryContacts = sortedPrimaryContacts.filter(c => c.id !== primaryContactId);
        let demotePrimaryContactIds = demotablePrimaryContacts.map(c => c.id);
        if(demotePrimaryContactIds.length){
            // point all secondary contacts to the new primary
            await Contact.update({linkedId: primaryContactId}, {where: {linkedId: demotePrimaryContactIds, linkPrecedence: LinkPrecedence.Secondary}})
            // demote all earlier primary contacts to secondary, and link to the correct primary
            await Contact.update({linkedId: primaryContactId, linkPrecedence: LinkPrecedence.Secondary}, {where : {id : demotePrimaryContactIds}})
        }
        return primaryContactId;
    }
    else return contacts[0].id;
}

export { identifyCustomer }