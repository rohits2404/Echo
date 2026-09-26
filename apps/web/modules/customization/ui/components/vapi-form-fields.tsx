import { UseFormReturn } from "react-hook-form"
import { FormSchema } from "../../types"
import {
    useVapiAssistants,
    useVapiPhoneNumbers,
} from "@/modules/plugins/hooks/use-vapi-data"
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@workspace/ui/components/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@workspace/ui/components/select"

interface VapiFormFieldsProps {
    form: UseFormReturn<FormSchema>
}

export const VapiFormFields = ({ form }: VapiFormFieldsProps) => {
    const { data: assistants, isLoading: assistantsLoading } =
        useVapiAssistants()
    const { data: phoneNumbers, isLoading: phoneNumbersLoading } =
        useVapiPhoneNumbers()

    const disabled = form.formState.isSubmitting

    return (
        <>
            <FormField
                control={form.control}
                name="vapiSettings.assistantId"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Voice Assistant</FormLabel>
                        <Select
                            disabled={assistantsLoading || disabled}
                            onValueChange={field.onChange}
                            value={field.value}
                        >
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue
                                        placeholder={
                                            assistantsLoading
                                                ? "Loading Assistants..."
                                                : "Select An Assistant"
                                        }
                                    />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                {assistants.map((assistant) => (
                                    <SelectItem
                                        key={assistant.id}
                                        value={assistant.id}
                                    >
                                        {assistant.name || "Unnamed Assistant"}{" "}
                                        -{" "}
                                        {assistant.model?.model ||
                                            "Unknown Model"}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormDescription>
                            The Vapi Assistant To Use For Voice Calls
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="vapiSettings.phoneNumber"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Display Phone Number</FormLabel>
                        <Select
                            disabled={phoneNumbersLoading || disabled}
                            onValueChange={field.onChange}
                            value={field.value}
                        >
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue
                                        placeholder={
                                            assistantsLoading
                                                ? "Loading Phone Numbers..."
                                                : "Select a Phone Number"
                                        }
                                    />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                {phoneNumbers.map((phone) => (
                                    <SelectItem
                                        key={phone.id}
                                        value={phone.number || phone.id}
                                    >
                                        {phone.number || "Unknown"} -{" "}
                                        {phone.name || "Unnamed"}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormDescription>
                            Phone Number To Display In The Widget
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </>
    )
}
