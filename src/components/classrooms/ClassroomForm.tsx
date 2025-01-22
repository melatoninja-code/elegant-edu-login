import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const classroomFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  room_number: z.string().min(1, "Room number is required"),
  capacity: z.string().min(1, "Capacity is required").transform(Number),
  type: z.enum(["lecture_hall", "laboratory", "standard", "computer_lab", "music_room", "art_studio", "gymnasium"]),
  floor: z.string().min(1, "Floor is required").transform(Number),
  building: z.string().min(1, "Building is required"),
  description: z.string().optional(),
})

export function ClassroomForm() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof classroomFormSchema>>({
    resolver: zodResolver(classroomFormSchema),
    defaultValues: {
      name: "",
      room_number: "",
      capacity: "",
      type: "standard",
      floor: "",
      building: "Main Building",
      description: "",
    },
  })

  const onSubmit = async (values: z.infer<typeof classroomFormSchema>) => {
    setIsLoading(true)
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error("Not authenticated")

      const { error } = await supabase.from("classrooms").insert({
        ...values,
        created_by: userData.user.id,
      })

      if (error) throw error

      toast({
        title: "Classroom created",
        description: "The classroom has been created successfully.",
      })
      form.reset()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create classroom. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter classroom name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="room_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Room Number</FormLabel>
              <FormControl>
                <Input placeholder="Enter room number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="capacity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Capacity</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Enter capacity" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select classroom type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="lecture_hall">Lecture Hall</SelectItem>
                  <SelectItem value="laboratory">Laboratory</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="computer_lab">Computer Lab</SelectItem>
                  <SelectItem value="music_room">Music Room</SelectItem>
                  <SelectItem value="art_studio">Art Studio</SelectItem>
                  <SelectItem value="gymnasium">Gymnasium</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="floor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Floor</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Enter floor number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="building"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Building</FormLabel>
              <FormControl>
                <Input placeholder="Enter building name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Enter description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading}>
          Create Classroom
        </Button>
      </form>
    </Form>
  )
}