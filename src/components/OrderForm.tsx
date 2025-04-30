
import React, { useState, useEffect } from "react";
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
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type Product = {
  id: string;
  name: string;
};

type Service = {
  id: string;
  name: string;
};

type ProductItem = {
  id: number;
  product: string;
  product_id: string;
  customProduct?: string;
  weight: string;
  services: {
    id: number;
    service_id: string;
    name: string;
    isCustom: boolean;
    customService?: string;
  }[];
};

const OrderForm = () => {
  const { employeeName, workshopAddress, employeeId, workshopId } = useAuth();
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
      product_id: "",
      weight: "",
      services: [],
    },
  ]);
  
  // State for products and services from Supabase
  const [productOptions, setProductOptions] = useState<Product[]>([]);
  const [serviceOptions, setServiceOptions] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch products and services from Supabase
  useEffect(() => {
    const fetchProductsAndServices = async () => {
      setIsLoading(true);
      
      // Fetch products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id, name');

      if (productsError) {
        console.error('Error fetching products:', productsError);
      } else {
        setProductOptions(productsData || []);
      }

      // Fetch services
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('id, name');

      if (servicesError) {
        console.error('Error fetching services:', servicesError);
      } else {
        setServiceOptions(servicesData || []);
      }

      setIsLoading(false);
    };

    fetchProductsAndServices();
  }, []);

  const handleReset = () => {
    setClientName("");
    setClientPhone("");
    setPrice("");
    setNotes("");
    setPriority("standard");
    setDate(new Date());
    setProducts([
      {
        id: 1,
        product: "",
        product_id: "",
        weight: "",
        services: [],
      },
    ]);
  };

  const handleProductChange = (
    productId: number,
    field: "product" | "weight",
    value: string
  ) => {
    setProducts(
      products.map((p) => {
        if (p.id === productId) {
          if (field === "product") {
            const selectedProduct = productOptions.find(po => po.id === value);
            const productName = selectedProduct ? selectedProduct.name : "";
            
            if (productName === "Другое") {
              return { 
                ...p, 
                product_id: value,
                product: productName, 
                customProduct: "", 
                services: [] 
              };
            }
            
            return { 
              ...p, 
              product_id: value,
              product: productName
            };
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
                  service_id: "",
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
                const selectedService = serviceOptions.find(so => so.id === value);
                const serviceName = selectedService ? selectedService.name : "";
                
                if (serviceName === "Другое") {
                  return {
                    ...s,
                    service_id: value,
                    name: serviceName,
                    isCustom: true,
                    customService: "",
                  };
                }
                
                return { 
                  ...s, 
                  service_id: value,
                  name: serviceName, 
                  isCustom: false 
                };
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
          product_id: "",
          weight: "",
          services: [],
        },
      ]);
    }
  };

  const handleSaveOrder = async () => {
    if (!clientName.trim()) {
      toast({
        title: "Ошибка",
        description: "Укажите имя клиента",
        variant: "destructive",
      });
      return;
    }

    if (!products[0].product) {
      toast({
        title: "Ошибка",
        description: "Добавьте хотя бы одно изделие",
        variant: "destructive",
      });
      return;
    }

    // Format services data for JSON storage
    const servicesData = products.filter(p => p.product).map(product => {
      const servicesList = product.services.map(service => {
        if (service.isCustom && service.customService) {
          return service.customService;
        }
        return service.name;
      }).filter(Boolean);

      return {
        product: product.product === "Другое" && product.customProduct 
          ? product.customProduct 
          : product.product,
        weight: product.weight,
        services: servicesList
      };
    });

    try {
      // Insert the order into Supabase
      const { data, error } = await supabase
        .from('orders')
        .insert({
          date: date.toISOString(),
          workshop_id: workshopId,
          employee_id: employeeId,
          client_name: clientName,
          client_phone: clientPhone,
          priority: priority,
          status: 'new',
          services: servicesData,
          notes: notes,
          price: price,
          // photos_path will be added once file uploads are implemented
        })
        .select();

      if (error) {
        console.error('Error saving order:', error);
        toast({
          title: "Ошибка",
          description: "Не удалось сохранить заказ",
          variant: "destructive",
        });
      } else {
        // Create order log entry
        if (data && data.length > 0) {
          const orderId = data[0].id;
          
          const { error: logError } = await supabase
            .from('order_logs')
            .insert({
              order_id: orderId,
              order_date: date.toISOString(),
              accepted_by: employeeId,
              // completed_by and issued_by will be null initially
            });
            
          if (logError) {
            console.error('Error creating log entry:', logError);
          }
          
          toast({
            title: "Успех",
            description: `Заказ #${orderId} успешно сохранен`,
          });
          
          // Reset the form after successful save
          handleReset();
        }
      }
    } catch (err) {
      console.error('Error in save process:', err);
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при сохранении",
        variant: "destructive",
      });
    }
  };

  const handlePrintOrder = () => {
    // Will be implemented with PDF generation
    toast({
      title: "Информация",
      description: "Функция печати будет доступна в следующей версии",
    });
  };

  const getOtherProductId = () => {
    return productOptions.find(p => p.name === "Другое")?.id || "";
  };

  const getOtherServiceId = () => {
    return serviceOptions.find(s => s.name === "Другое")?.id || "";
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
                    {isLoading ? (
                      <div className="jewelry-input h-10 flex items-center justify-center">
                        Загрузка...
                      </div>
                    ) : (
                      <Select
                        value={product.product_id}
                        onValueChange={(value) =>
                          handleProductChange(product.id, "product", value)
                        }
                      >
                        <SelectTrigger className="jewelry-input">
                          <SelectValue placeholder="Выберите тип изделия" />
                        </SelectTrigger>
                        <SelectContent className="bg-jewelry-dark border-border">
                          {productOptions.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
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
                        {isLoading ? (
                          <div className="jewelry-input h-10 flex items-center justify-center">
                            Загрузка...
                          </div>
                        ) : (
                          <Select
                            value={service.service_id}
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
                                <SelectItem value={getOtherServiceId()}>Другое</SelectItem>
                              ) : (
                                serviceOptions.map((s) => (
                                  <SelectItem key={s.id} value={s.id}>
                                    {s.name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        )}
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
