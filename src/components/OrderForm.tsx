
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CalendarIcon, Save, Plus, Printer } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data (will be replaced with Supabase data later)
const mockProducts = [
  { id: 1, name: "Кольцо" },
  { id: 2, name: "Цепочка" },
  { id: 3, name: "Браслет" },
  { id: 4, name: "Серьги" },
  { id: 5, name: "Другое" },
];

const mockServices = [
  { id: 1, name: "Ремонт" },
  { id: 2, name: "Чистка" },
  { id: 3, name: "Гравировка" },
  { id: 4, name: "Полировка" },
  { id: 5, name: "Изменение размера" },
  { id: 6, name: "Другое" },
];

type ProductItem = {
  id: number;
  product: string;
  customProduct?: string;
  weight: string;
  services: {
    id: number;
    name: string;
    isCustom: boolean;
    customService?: string;
  }[];
};

const OrderForm = () => {
  const { employeeName, workshopAddress } = useAuth();
  const [date, setDate] = useState<Date>(new Date());
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [price, setPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [priority, setPriority] = useState("standard");
  const [products, setProducts] = useState<ProductItem[]>([
    {
      id: 1,
      product: "",
      weight: "",
      services: [],
    },
  ]);

  const handleReset = () => {
    setClientName("");
    setClientPhone("");
    setPrice("");
    setNotes("");
    setPriority("standard");
    setProducts([
      {
        id: 1,
        product: "",
        weight: "",
        services: [],
      },
    ]);
  };

  const handleProductChange = (
    productId: number,
    field: keyof ProductItem,
    value: string
  ) => {
    setProducts(
      products.map((p) => {
        if (p.id === productId) {
          if (field === "product" && value === "Другое") {
            return { ...p, [field]: value, customProduct: "", services: [] };
          }
          return { ...p, [field]: value };
        }
        return p;
      })
    );
  };

  const handleCustomProductChange = (productId: number, value: string) => {
    setProducts(
      products.map((p) => {
        if (p.id === productId) {
          return { ...p, customProduct: value };
        }
        return p;
      })
    );
  };

  const handleAddService = (productId: number) => {
    if (
      products.find((p) => p.id === productId)?.services.length! < 4
    ) {
      setProducts(
        products.map((p) => {
          if (p.id === productId) {
            return {
              ...p,
              services: [
                ...p.services,
                {
                  id: p.services.length + 1,
                  name: "",
                  isCustom: false,
                },
              ],
            };
          }
          return p;
        })
      );
    }
  };

  const handleServiceChange = (
    productId: number,
    serviceId: number,
    value: string
  ) => {
    setProducts(
      products.map((p) => {
        if (p.id === productId) {
          return {
            ...p,
            services: p.services.map((s) => {
              if (s.id === serviceId) {
                if (value === "Другое") {
                  return {
                    ...s,
                    name: value,
                    isCustom: true,
                    customService: "",
                  };
                }
                return { ...s, name: value, isCustom: false };
              }
              return s;
            }),
          };
        }
        return p;
      })
    );
  };

  const handleCustomServiceChange = (
    productId: number,
    serviceId: number,
    value: string
  ) => {
    setProducts(
      products.map((p) => {
        if (p.id === productId) {
          return {
            ...p,
            services: p.services.map((s) => {
              if (s.id === serviceId) {
                return { ...s, customService: value };
              }
              return s;
            }),
          };
        }
        return p;
      })
    );
  };

  const handleAddProduct = () => {
    if (products.length < 4) {
      setProducts([
        ...products,
        {
          id: products.length + 1,
          product: "",
          weight: "",
          services: [],
        },
      ]);
    }
  };

  const handleSaveOrder = () => {
    // Will be implemented with Supabase
    console.log({
      date,
      employeeName,
      workshopAddress,
      clientName,
      clientPhone,
      products,
      notes,
      price,
      priority,
    });
  };

  const handlePrintOrder = () => {
    // Will be implemented with PDF generation
    console.log("Printing order...");
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-jewelry-gold">
          Оформление заказа
        </h1>
        <Button onClick={handleReset} className="jewelry-btn-outline">
          Новый заказ
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <Card className="jewelry-card">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-jewelry-gold">
              Основная информация
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Номер заказа</Label>
                <Input
                  type="text"
                  placeholder="Будет назначен автоматически"
                  disabled
                  className="jewelry-input"
                />
              </div>

              <div className="space-y-2">
                <Label>Дата</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className="jewelry-input w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? (
                        format(date, "dd.MM.yyyy", { locale: ru })
                      ) : (
                        <span>Выберите дату</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-jewelry-dark border-border">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(date) => date && setDate(date)}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Имя сотрудника</Label>
                <Input
                  type="text"
                  value={employeeName || ""}
                  disabled
                  className="jewelry-input"
                />
              </div>

              <div className="space-y-2">
                <Label>Мастерская</Label>
                <Input
                  type="text"
                  value={workshopAddress || ""}
                  disabled
                  className="jewelry-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Имя клиента</Label>
                <Input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="jewelry-input"
                  placeholder="Имя клиента"
                />
              </div>

              <div className="space-y-2">
                <Label>Телефон клиента</Label>
                <Input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="jewelry-input"
                  placeholder="+7 (___) ___-__-__"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="jewelry-card">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-jewelry-gold">
              Детали заказа
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Приоритет</Label>
              </div>
              <Select
                value={priority}
                onValueChange={setPriority}
              >
                <SelectTrigger className="jewelry-input">
                  <SelectValue placeholder="Выберите приоритет" />
                </SelectTrigger>
                <SelectContent className="bg-jewelry-dark border-border">
                  <SelectItem value="standard">Стандартный</SelectItem>
                  <SelectItem value="urgent">Срочный</SelectItem>
                  <SelectItem value="non-urgent">Не срочный</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Предварительная цена</Label>
              <Input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="jewelry-input"
                placeholder="₽"
              />
            </div>

            <div className="space-y-2">
              <Label>Дополнительная информация</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="jewelry-input min-h-[80px]"
                placeholder="Комментарии к заказу"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium text-jewelry-gold">
            Изделия и услуги
          </h2>
          {products.length < 4 && (
            <Button
              onClick={handleAddProduct}
              className="jewelry-btn-outline flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              <span>Добавить изделие</span>
            </Button>
          )}
        </div>

        <div className="space-y-6">
          {products.map((product) => (
            <Card key={product.id} className="jewelry-card">
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Изделие</Label>
                    <Select
                      value={product.product}
                      onValueChange={(value) =>
                        handleProductChange(product.id, "product", value)
                      }
                    >
                      <SelectTrigger className="jewelry-input">
                        <SelectValue placeholder="Выберите тип изделия" />
                      </SelectTrigger>
                      <SelectContent className="bg-jewelry-dark border-border">
                        {mockProducts.map((p) => (
                          <SelectItem key={p.id} value={p.name}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {product.product === "Другое" && (
                      <Input
                        className="jewelry-input mt-2"
                        placeholder="Укажите изделие"
                        value={product.customProduct || ""}
                        onChange={(e) =>
                          handleCustomProductChange(product.id, e.target.value)
                        }
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Вес (г)</Label>
                    <Input
                      type="text"
                      className="jewelry-input"
                      placeholder="Вес в граммах"
                      value={product.weight}
                      onChange={(e) =>
                        handleProductChange(product.id, "weight", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Услуги</Label>
                    {product.services.length < 4 && (
                      <Button
                        size="sm"
                        onClick={() => handleAddService(product.id)}
                        disabled={!product.product}
                        className="text-xs h-8 jewelry-btn-outline flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Добавить услугу</span>
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-2 mt-2">
                    {product.services.map((service) => (
                      <div
                        key={service.id}
                        className="grid grid-cols-1 md:grid-cols-2 gap-2"
                      >
                        <Select
                          value={service.name}
                          disabled={product.product === "Другое"}
                          onValueChange={(value) =>
                            handleServiceChange(
                              product.id,
                              service.id,
                              value
                            )
                          }
                        >
                          <SelectTrigger className="jewelry-input">
                            <SelectValue placeholder="Выберите услугу" />
                          </SelectTrigger>
                          <SelectContent className="bg-jewelry-dark border-border">
                            {product.product === "Другое" ? (
                              <SelectItem value="Другое">Другое</SelectItem>
                            ) : (
                              mockServices.map((s) => (
                                <SelectItem key={s.id} value={s.name}>
                                  {s.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        {service.isCustom && (
                          <Input
                            className="jewelry-input"
                            placeholder="Укажите услугу"
                            value={service.customService || ""}
                            onChange={(e) =>
                              handleCustomServiceChange(
                                product.id,
                                service.id,
                                e.target.value
                              )
                            }
                          />
                        )}
                      </div>
                    ))}
                    {product.services.length === 0 && product.product && (
                      <div className="text-sm text-jewelry-silver italic">
                        Нажмите "Добавить услугу" для выбора услуг
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-end">
        <Button
          onClick={handlePrintOrder}
          className="jewelry-btn-outline flex gap-2 items-center"
        >
          <Printer className="h-4 w-4" />
          Печать
        </Button>
        <Button
          onClick={handleSaveOrder}
          className="jewelry-btn flex gap-2 items-center"
        >
          <Save className="h-4 w-4" />
          Сохранить
        </Button>
      </div>
    </div>
  );
};

export default OrderForm;
